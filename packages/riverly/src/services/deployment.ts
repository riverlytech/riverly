import { and, desc, eq, or } from "drizzle-orm";
import z from "zod/v4";
import {
  Database,
  serverBuildTable,
  InsertDeploymentLog,
  InsertServerDeployment,
  InsertServerRevision,
  serverDeploymentLogTable,
  serverDeploymentTable,
  GitHubInsertServerBuild,
  serverRevisionTable,
  serverInstallTable,
  serverTable,
  UpdateServerBuild,
  UpdateServerDeployment,
  UpdateServerBuildDeploy,
} from "@riverly/db";
import {
  type DeploymentTargetType,
  RevisionStatusValue,
  TriggerTypeValue,
  DeploymentStatusEnum,
  DeploymentTarget,
  DeployWithGitHubRequest,
} from "@riverly/ty";
import { fn, NamedError } from "@riverly/utils";

import { GitHubSourceDeployer } from "@riverly/infra";
import {
  CloudBuildGitHubDeployer,
  useDefualtGCPConfig,
  useDefualtGCPBuildConfig,
} from "@riverly/infra/gcp";

export const ServerInstallError = NamedError.create(
  "ServerInstallError",
  z.object({
    message: z.string(),
  }),
);

export const BuildInsertError = NamedError.create(
  "BuildInsertError",
  z.object({
    message: z.string(),
  }),
);

export const DeployInsertError = NamedError.create(
  "DeployInsertError",
  z.object({
    message: z.string(),
  }),
);

export const RevisionInsertError = NamedError.create(
  "RevisionInsertError",
  z.object({
    message: z.string(),
  }),
);

export const DeployJobRequestError = NamedError.create(
  "DeployJobRequestError",
  z.object({
    message: z.string(),
  }),
);

export namespace ServerDeployment {
  export const deployments = fn(
    z.object({
      organizationId: z.string(),
      target: z.enum([
        DeploymentTarget.DEVELOPMENT,
        DeploymentTarget.PREVIEW,
        DeploymentTarget.PRODUCTION,
        "all",
      ]),
      limit: z.number(),
    }),
    async (filter) => {
      const condition =
        filter.target === "all"
          ? or(
              eq(serverDeploymentTable.target, DeploymentTarget.PREVIEW),
              eq(serverDeploymentTable.target, DeploymentTarget.PRODUCTION),
            )
          : eq(serverDeploymentTable.target, filter.target as DeploymentTargetType);

      return await Database.use((db) =>
        db
          .select({
            deploymentId: serverDeploymentTable.id,
            title: serverTable.title,
            avatarUrl: serverTable.image,
            status: serverDeploymentTable.status,
            imageDigest: serverBuildTable.imageDigest,
            buildId: serverBuildTable.id,
            createdAt: serverDeploymentTable.createdAt,
          })
          .from(serverDeploymentTable)
          .innerJoin(serverTable, eq(serverDeploymentTable.serverId, serverTable.id))
          .innerJoin(serverBuildTable, eq(serverDeploymentTable.buildId, serverBuildTable.id))
          .where(and(eq(serverDeploymentTable.organizationId, filter.organizationId), condition))
          .orderBy(desc(serverDeploymentTable.createdAt))
          .limit(filter.limit),
      );
    },
  );

  export const orgDeployment = fn(
    z.object({
      organizationId: z.string(),
      deploymentId: z.string(),
    }),
    async (filter) => {
      const result = await Database.use((db) =>
        db
          .select({
            deploymentId: serverDeploymentTable.id,
            title: serverTable.title,
            avatarUrl: serverTable.image,
            status: serverDeploymentTable.status,
            imageDigest: serverBuildTable.imageDigest,
            buildId: serverBuildTable.id,
            createdAt: serverDeploymentTable.createdAt,
            githubRepo: serverBuildTable.gitHubRepo,
            gitHubRef: serverBuildTable.gitHubRef,
            githubOrg: serverBuildTable.githubOwner,
            commitHash: serverBuildTable.commitHash,
            target: serverDeploymentTable.target,
          })
          .from(serverDeploymentTable)
          .innerJoin(serverTable, eq(serverDeploymentTable.serverId, serverTable.id))
          .innerJoin(serverBuildTable, eq(serverDeploymentTable.buildId, serverBuildTable.id))
          .where(
            and(
              eq(serverDeploymentTable.organizationId, filter.organizationId),
              eq(serverDeploymentTable.id, filter.deploymentId),
            ),
          )
          .execute(),
      );
      return result[0] ?? null;
    },
  );

  export const serverDeployments = fn(
    z.object({
      organizationId: z.string(),
      serverId: z.string(),
      target: z.enum([
        DeploymentTarget.DEVELOPMENT,
        DeploymentTarget.PREVIEW,
        DeploymentTarget.PRODUCTION,
        "all",
      ]),
      limit: z.number(),
    }),
    async (filter) => {
      const condition =
        filter.target === "all"
          ? or(
              eq(serverDeploymentTable.target, DeploymentTarget.PREVIEW),
              eq(serverDeploymentTable.target, DeploymentTarget.PRODUCTION),
            )
          : eq(serverDeploymentTable.target, filter.target as DeploymentTargetType);

      return await Database.use((db) =>
        db
          .select({
            deploymentId: serverDeploymentTable.id,
            title: serverTable.title,
            avatarUrl: serverTable.image,
            status: serverDeploymentTable.status,
            imageDigest: serverBuildTable.imageDigest,
            buildId: serverBuildTable.id,
            createdAt: serverDeploymentTable.createdAt,
          })
          .from(serverDeploymentTable)
          .innerJoin(serverTable, eq(serverDeploymentTable.serverId, serverTable.id))
          .innerJoin(serverBuildTable, eq(serverDeploymentTable.buildId, serverBuildTable.id))
          .where(
            and(
              eq(serverDeploymentTable.organizationId, filter.organizationId),
              eq(serverDeploymentTable.serverId, filter.serverId),
              condition,
            ),
          )
          .orderBy(desc(serverDeploymentTable.createdAt))
          .limit(filter.limit),
      );
    },
  );

  export const triggerGitHubBuildDeploy = fn(DeployWithGitHubRequest, async (deploy) => {
    return await Database.transaction(async (tx) => {
      const installedServer = await tx
        .select()
        .from(serverInstallTable)
        .where(
          and(
            eq(serverInstallTable.organizationId, deploy.org.organizationId),
            eq(serverInstallTable.serverId, deploy.server.serverId),
          ),
        )
        .execute()
        .then((row) => row[0]);
      if (!installedServer)
        throw new DeployInsertError({
          message: "Failed to fetch installed server",
        });

      const newGitHubBuild: z.infer<typeof GitHubInsertServerBuild> = {
        serverId: deploy.server.serverId,
        organizationId: deploy.org.organizationId,
        gitHubRepo: deploy.githubRepo,
        gitHubRef: deploy.githubRef,
        githubOwner: deploy.githubOwner,
        commitHash: deploy.commitHash,
        status: DeploymentStatusEnum.PLACED,
        configRevision: deploy.serverConfig.configRevision,
        configHash: deploy.serverConfig.configHash,
        envs: deploy.serverConfig.envs,
        config: deploy.serverConfig.inputs,
        rootDir: deploy.serverConfig.rootDir,
        triggerType: TriggerTypeValue.MANUAL,
      };

      const newBuildParsed = GitHubInsertServerBuild.safeParse(newGitHubBuild);
      if (!newBuildParsed.success) {
        throw new BuildInsertError({
          message: "Failed to validate GitHub build insert schema",
        });
      }

      const newBuild = await tx
        .insert(serverBuildTable)
        .values(newBuildParsed.data)
        .returning()
        .execute()
        .then((row) => row[0]);
      if (!newBuild) {
        throw new BuildInsertError({
          message: "Failed to insert GitHub build",
        });
      }
      const newGitHubDeployment: z.infer<typeof InsertServerDeployment> = {
        buildId: newBuild.id,
        serverId: newBuild.serverId,
        organizationId: newBuild.organizationId,
        installId: installedServer.id,
        status: DeploymentStatusEnum.PLACED, // build + deploy is atomic having same status.
        target: deploy.target,
      };
      const newDeploymentParsed = InsertServerDeployment.safeParse(newGitHubDeployment);
      if (!newDeploymentParsed.success) {
        throw new DeployInsertError({
          message: "Failed to validate deployment insert schema",
        });
      }

      const newDeployment = await tx
        .insert(serverDeploymentTable)
        .values(newDeploymentParsed.data)
        .returning()
        .execute()
        .then((row) => row[0]);
      if (!newDeployment) {
        throw new DeployInsertError({
          message: "Failed to insert deployment",
        });
      }

      const newRevision: z.infer<typeof InsertServerRevision> = {
        buildId: newBuild.id,
        deploymentId: newDeployment.id,
        serverId: newDeployment.serverId,
        organizationId: newDeployment.organizationId,
        status: RevisionStatusValue.DRAFT,
      };
      const newRevisionParsed = InsertServerRevision.safeParse(newRevision);
      if (!newRevisionParsed.success) {
        throw new RevisionInsertError({
          message: "Failed to validate insert revision schema",
        });
      }

      const revision = await tx
        .insert(serverRevisionTable)
        .values(newRevisionParsed.data)
        .returning()
        .execute()
        .then((row) => row[0]);
      if (!revision) {
        throw new RevisionInsertError({
          message: "Failed to insert revision",
        });
      }

      const requestDeployer: z.infer<typeof GitHubSourceDeployer> = {
        org: {
          organizationId: deploy.org.organizationId,
          name: deploy.org.name,
        },
        member: {
          memberId: deploy.member.memberId,
          userId: deploy.member.userId,
          role: deploy.member.role,
          username: deploy.member.username,
        },
        server: {
          serverId: deploy.server.serverId,
          title: deploy.server.title,
        },
        githubRepo: deploy.githubRepo,
        githubOrg: deploy.githubOwner,
        githubRef: deploy.githubRef,
        githubAppId: deploy.githubAppId,
        githubInstallationId: deploy.githubInstallationId,
        commitHash: deploy.commitHash,
        build: {
          buildId: newBuild.id,
          envs: deploy.serverConfig.envs,
          inputs: deploy.serverConfig.inputs,
          configRevision: deploy.serverConfig.configRevision,
          configHash: deploy.serverConfig.configHash,
          rootDir: deploy.serverConfig.rootDir,
        },
        deployment: {
          deploymentId: newDeployment.id,
          target: newDeployment.target,
          publicId: newDeployment.target,
        },
      };

      const requestParsed = GitHubSourceDeployer.safeParse(requestDeployer);
      if (!requestParsed.success) {
        throw new DeployJobRequestError({
          message: "Failed to validate deploy job request schema",
        });
      }

      //
      // GCP infra invoker, can be later moved to workers
      // const { data: args } = requestParsed;
      // const deploymentId = args.deployment.deploymentId;
      // const deployer = (await CloudBuildBuildDeploy.init()) as Awaited<
      //   ReturnType<typeof CloudBuildBuildDeploy.init>
      // > & {
      //   streamLogs?: (
      //     options: CloudBuildLogStreamOptions
      //   ) => AsyncGenerator<CloudBuildLogEvent>;
      // };
      // console.info(`[Deployment: ${deploymentId}] Starting build...`);

      const params = requestParsed.data;
      const deploymentId = params.deployment.deploymentId;

      const gcpConfig = useDefualtGCPConfig();
      const gcpBuildConfig = useDefualtGCPBuildConfig();
      const deployer = new CloudBuildGitHubDeployer(gcpConfig, gcpBuildConfig);

      const result = await deployer.deploy(params);
      const cbBuildID =
        (typeof result.resourceIds?.cbBuildID === "string"
          ? result.resourceIds.cbBuildID
          : undefined) ??
        (typeof result.metadata?.cbBuildID === "string" ? result.metadata.cbBuildID : undefined);

      if (!cbBuildID) {
        console.warn(`[Deployment: ${deploymentId}] Failed to fetch Cloud Build ID`);
      }
      console.info(`[Deployment: ${deploymentId}] Status: ${result.status}`);
      console.info(
        `[Deployment: ${deploymentId}] Triggered Cloud Build with Cloud Build ID: ${cbBuildID}`,
      );
      console.info(`[Deployment: ${deploymentId}] Scheduled build N Deploy...`);

      // await rsc.beginRpc(
      //   deployment.deploymentId,
      //   CloudBuildBuildNDeploy.id,
      //   { ...requestParsed.data },
      //   rsc.options({
      //     target: "poll://any@workers",
      //   })
      // );

      return {
        deploymentId: newDeployment.id,
        buildId: newBuild.id,
        revisionId: revision.revisionId,
      };
    });
  });

  export const updateBuildDeploy = fn(
    UpdateServerBuildDeploy.extend({
      buildId: z.string(),
      deploymentId: z.string(),
    }),
    async (updates) => {
      return await Database.transaction(async (tx) => {
        await tx
          .update(serverBuildTable)
          .set({
            imageRef: updates.build.imageRef,
            imageDigest: updates.build.imageDigest,
            builtAt: updates.build.builtAt,
            status: updates.build.status,
          })
          .where(eq(serverBuildTable.id, updates.buildId))
          .returning()
          .execute()
          .then((row) => row[0] ?? null);

        await tx
          .update(serverDeploymentTable)
          .set({
            status: updates.deployment.status,
          })
          .where(eq(serverDeploymentTable.id, updates.deploymentId))
          .returning()
          .execute()
          .then((row) => row[0] ?? null);
      });
    },
  );

  export const updateBuild = fn(
    UpdateServerBuild.extend({ buildId: z.string() }),
    async (updates) => {
      return await Database.transaction(async (tx) => {
        await tx
          .update(serverBuildTable)
          .set({
            imageRef: updates.imageRef,
            imageDigest: updates.imageDigest,
            builtAt: updates.builtAt,
            status: updates.status,
          })
          .where(eq(serverBuildTable.id, updates.buildId))
          .returning()
          .execute()
          .then((row) => row[0] ?? null);
      });
    },
  );

  export const updateDeploy = fn(
    UpdateServerDeployment.extend({ deploymentId: z.string() }),
    async (updates) => {
      return await Database.transaction(async (tx) => {
        await tx
          .update(serverDeploymentTable)
          .set({
            status: updates.status,
          })
          .where(eq(serverDeploymentTable.id, updates.deploymentId))
          .returning()
          .execute()
          .then((row) => row[0] ?? null);
      });
    },
  );

  export const ingestLog = fn(
    InsertDeploymentLog,
    async (log) =>
      await Database.use((db) =>
        db
          .insert(serverDeploymentLogTable)
          .values(log)
          .onConflictDoUpdate({
            target: serverDeploymentLogTable.logId,
            set: {
              message: log.message,
              timestamp: log.timestamp,
              level: log.level,
            },
          })
          .returning({ logId: serverDeploymentLogTable.logId })
          .execute()
          .then((row) => row[0] ?? null),
      ),
  );
}
