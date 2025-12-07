import { fn, NamedError } from "@riverly/utils";
import { createHash } from "crypto";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { ulid } from "ulid";
import z from "zod/v4";
import { Database, organizations } from "@riverly/db";
import { parseRepoUrl } from "./helpers";
import {
  AddServer,
  CreateServer,
  GitHubCreateServer,
  GitHubImportServer,
  serverConfigTable,
  serverInstallTable,
  serverTable,
  UpsertServerConfig,
} from "@riverly/db";
import { ServerVisibility, ServerVisibilityEnum } from "@riverly/ty";
import { GitHub } from "./github";

export const ServerAddError = NamedError.create(
  "ServerAddError",
  z.object({
    message: z.string(),
  }),
);

export const GitHubError = NamedError.create(
  "GitHubError",
  z.object({
    message: z.string(),
    githubAppId: z.number().optional(),
  }),
);

export namespace Server {
  export const fromID = fn(
    z.object({
      callerOrgId: z.string(),
      serverId: z.string(),
    }),
    async (filter) => {
      const result = await Database.use(async (db) => {
        const r = await db
          .select({
            serverId: serverTable.id,
            title: serverTable.title,
            description: serverTable.description,
            verified: serverTable.verified,
            image: serverTable.image,
            usageCount: serverTable.usageCount,
            visibility: serverTable.visibility,
            mode: serverTable.mode,
            org: {
              organizationId: organizations.id,
              name: organizations.name,
              logo: organizations.logo,
            },
            license: serverTable.license,
            readme: serverTable.readme,
          })
          .from(serverTable)
          .innerJoin(organizations, eq(organizations.id, serverTable.organizationId))
          .where(eq(serverTable.id, filter.serverId))
          .execute()
          .then((row) => row[0] ?? null);
        return r;
      });
      if (!result) return null;
      //
      // check for visibility, if private then check ownership,
      // if public return server
      if (result.visibility === ServerVisibilityEnum.PRIVATE) {
        if (filter.callerOrgId === result.org.organizationId) return result;
        else return null;
      }
      return result;
    },
  );

  export const fromIDWithGit = fn(
    z.object({
      organizationId: z.string(),
      serverId: z.string(),
    }),
    async (filter) => {
      const result = await Database.use(async (db) => {
        const r = await db
          .select({
            serverId: serverTable.id,
            title: serverTable.title,
            description: serverTable.description,
            verified: serverTable.verified,
            image: serverTable.image,
            usageCount: serverTable.usageCount,
            visibility: serverTable.visibility,
            githubRepo: serverTable.githubRepo,
            githubOwner: serverTable.githubOwner,
            branch: serverTable.branch,
            mode: serverTable.mode,
            org: {
              organizationId: organizations.id,
              name: organizations.name,
              logo: organizations.logo,
            },
            license: serverTable.license,
            readme: serverTable.readme,
          })
          .from(serverTable)
          .innerJoin(organizations, eq(organizations.id, serverTable.organizationId))
          .where(
            and(
              eq(serverTable.organizationId, filter.organizationId),
              eq(serverTable.id, filter.serverId),
            ),
          )
          .execute()
          .then((row) => row[0] ?? null);
        return r;
      });
      if (!result) return result;
      //
      // check for visibility, if private then check ownership,
      // if public return server
      if (result.visibility === ServerVisibilityEnum.PRIVATE) {
        if (filter.organizationId === result.org.organizationId) return result;
        else return null;
      }
      return result;
    },
  );

  export const publicServer = fn(
    z.object({
      organizationId: z.string(),
      serverId: z.string(),
    }),
    async (filter) =>
      await Database.use((db) =>
        db
          .select({
            serverId: serverTable.id,
            title: serverTable.title,
            description: serverTable.description,
            verified: serverTable.verified,
            image: serverTable.image,
            usageCount: serverTable.usageCount,
            visibility: serverTable.visibility,
            mode: serverTable.mode,
            org: {
              organizationId: organizations.id,
              name: organizations.name,
              logo: organizations.logo,
            },
            license: serverTable.license,
            readme: serverTable.readme,
          })
          .from(serverTable)
          .innerJoin(organizations, eq(organizations.id, serverTable.organizationId))
          .where(
            and(
              eq(serverTable.organizationId, filter.organizationId),
              eq(serverTable.id, filter.serverId),
              eq(serverTable.visibility, ServerVisibilityEnum.PUBLIC),
            ),
          )
          .execute()
          .then((row) => row[0] ?? null),
      ),
  );

  export const ownedServer = fn(
    z.object({
      organizationId: z.string(),
      serverId: z.string(),
    }),
    async (filter) =>
      await Database.use((db) =>
        db
          .select()
          .from(serverTable)
          .where(
            and(
              eq(serverTable.organizationId, filter.organizationId),
              eq(serverTable.id, filter.serverId),
            ),
          )
          .execute()
          .then((row) => row[0] ?? null),
      ),
  );

  export const orgServers = fn(
    z.object({
      organizationId: z.string(),
      visibility: z.enum([ServerVisibilityEnum.PRIVATE, ServerVisibilityEnum.PUBLIC, "both"]),
      limit: z.number().default(100),
    }),
    async (filter) => {
      const condition =
        filter.visibility === "both"
          ? or(
              eq(serverTable.visibility, ServerVisibilityEnum.PUBLIC),
              eq(serverTable.visibility, ServerVisibilityEnum.PRIVATE),
            )
          : eq(serverTable.visibility, filter.visibility as ServerVisibility);

      return await Database.use((db) =>
        db
          .select({
            serverId: serverTable.id,
            title: serverTable.title,
            description: serverTable.description,
            verified: serverTable.verified,
            image: serverTable.image,
            usageCount: serverTable.usageCount,
            visibility: serverTable.visibility,
            mode: serverTable.mode,
            org: {
              organizationId: organizations.id,
              name: organizations.name,
              logo: organizations.logo,
            },
            license: serverTable.license,
            readme: serverTable.readme,
          })
          .from(serverTable)
          .innerJoin(organizations, eq(serverTable.organizationId, organizations.id))
          .where(and(eq(organizations.id, filter.organizationId), condition))
          .orderBy(desc(serverTable.usageCount))
          .limit(filter.limit),
      );
    },
  );

  export const orgInstalledServers = fn(
    z.object({
      organizationId: z.string(),
      visibility: z.enum([ServerVisibilityEnum.PRIVATE, ServerVisibilityEnum.PUBLIC, "both"]),
      limit: z.number(),
    }),
    async (filter) => {
      const condition =
        filter.visibility === "both"
          ? or(
              eq(serverTable.visibility, ServerVisibilityEnum.PUBLIC),
              eq(serverTable.visibility, ServerVisibilityEnum.PRIVATE),
            )
          : eq(serverTable.visibility, filter.visibility as ServerVisibility);
      return await Database.use((db) =>
        db
          .select({
            serverId: serverTable.id,
            title: serverTable.title,
            description: serverTable.description,
            verified: serverTable.verified,
            image: serverTable.image,
            usageCount: serverTable.usageCount,
            visibility: serverTable.visibility,
            mode: serverTable.mode,
            org: {
              organizationId: organizations.id,
              name: organizations.name,
              logo: organizations.logo,
            },
            license: serverTable.license,
            readme: serverTable.readme,
          })
          .from(serverInstallTable)
          .innerJoin(serverTable, eq(serverInstallTable.serverId, serverTable.id))
          .innerJoin(organizations, eq(serverInstallTable.organizationId, organizations.id))
          .where(and(eq(serverInstallTable.organizationId, filter.organizationId), condition))
          .orderBy(desc(serverTable.usageCount), desc(serverTable.createdAt))
          .limit(filter.limit),
      );
    },
  );

  export const addNew = fn(AddServer, async (server) => {
    return await Database.transaction(async (tx) => {
      const parsed = CreateServer.safeParse(server);
      if (!parsed.success) throw new ServerAddError({ message: parsed.error.message });

      const [newServer] = await tx
        .insert(serverTable)
        .values({ ...parsed.data })
        .returning();
      if (!newServer) throw new ServerAddError({ message: "Failed to insert new server" });

      await tx.insert(serverInstallTable).values({
        serverId: newServer.id,
        organizationId: server.organizationId,
      });
      return newServer;
    });
  });

  export const importFromGitHub = fn(
    GitHubImportServer.extend({ githubAppId: z.number() }),
    async (server) => {
      const [parseErr, pr] = parseRepoUrl(server.repoUrl);
      if (parseErr || !pr) {
        throw new GitHubError({ message: "Bad GitHub repo name or URL" });
      }
      const ghInstalled = await GitHub.orgInstallation({
        organizationId: server.organizationId,
        githubAppId: server.githubAppId,
        account: pr.owner,
      });
      if (!ghInstalled) {
        throw new GitHubError({
          message: "GitHub account is not connected",
          githubAppId: server.githubAppId,
        });
      }

      const repo = await GitHub.repoDetail({
        githubInstallationId: ghInstalled.githubInstallationId,
        owner: pr.owner,
        repo: pr.repo,
      });
      if (!repo) {
        throw new GitHubError({
          message: "Repo does not exist or not connected",
        });
      }

      const repoReadme = await GitHub.repoReadme({
        githubInstallationId: ghInstalled.githubInstallationId,
        username: repo.owner.login,
        name: repo.name,
      });

      const request: z.infer<typeof GitHubCreateServer> = {
        title: server.title,
        description: server.description,
        visibility: server.visibility,
        organizationId: server.organizationId,
        userId: server.userId,
        githubRepo: repo.name,
        githubOwner: repo.owner.login,
        branch: repo.defaultBranch,
        githubRepositoryId: repo.id,
        license: repo.license ? { name: repo.license.name } : undefined,
        readme: repoReadme ?? undefined,
      };

      const requestParsed = GitHubCreateServer.safeParse(request);
      if (!requestParsed.success) {
        throw new GitHubError({
          message: "Failed GitHub import schema validation",
        });
      }

      return await Database.transaction(async (tx) => {
        const parsed = CreateServer.safeParse(requestParsed.data);
        if (!parsed.success) {
          throw new GitHubError({
            message: "Failed GitHub create server schema validation",
          });
        }

        const [newServer] = await tx.insert(serverTable).values(parsed.data).returning();
        if (!newServer) {
          throw new GitHubError({
            message: "Failed to insert GitHub import server",
          });
        }

        await tx.insert(serverInstallTable).values({
          serverId: newServer.id,
          organizationId: newServer.organizationId,
        });
        return newServer;
      });
    },
  );

  export function generateConfigHash(config: Record<string, any>): string {
    const configString = JSON.stringify(config, Object.keys(config).sort());
    return createHash("sha256").update(configString).digest("hex");
  }

  export const config = fn(z.string(), async (serverId) => {
    return await Database.transaction(async (tx) =>
      tx
        .select()
        .from(serverConfigTable)
        .where(eq(serverConfigTable.id, serverId))
        .execute()
        .then((row) => row[0] ?? null),
    );
  });

  export const upsertConfig = fn(UpsertServerConfig, async (upsert) => {
    return await Database.transaction(async (tx) => {
      const configHash = generateConfigHash(upsert.config ?? {});
      return tx
        .insert(serverConfigTable)
        .values({ ...upsert, configHash })
        .onConflictDoUpdate({
          target: serverConfigTable.id,
          set: {
            envs: upsert.envs,
            config: upsert.config,
            configHash: configHash,
            rootDir: upsert.rootDir,
            revision: ulid().toLowerCase(),
            updatedAt: sql`CURRENT_TIMESTAMP`,
          },
        })
        .returning()
        .execute()
        .then((row) => row[0] ?? null);
    });
  });

  type ServerResult = Awaited<ReturnType<typeof fromID>>;
  export type Server = NonNullable<ServerResult>;
}
