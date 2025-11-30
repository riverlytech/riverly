import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import z from "zod/v4";

import { env } from "@riverly/config";
import type { ServerConfigTable } from "@riverly/db";
import { parseRepoUrl } from "@riverly/riverly";
import { GitHub, Server, ServerDeployment } from "@riverly/riverly";
import { EnvsSchema, type Nothing, ServerConfigSchema } from "@riverly/ty";
import { DeploymentTarget, TriggerTypeValue } from "@riverly/ty";
import { DeployWithGitHubRequest } from "@riverly/ty";
import { toAsyncErrorValue } from "@riverly/utils";

import { ErrorCodeEnum } from "./errors";
import { verifyBetterAuthToken, orgMembership } from "../middlewares/middlewares";

const app = new Hono();

const DeploymentRequest = z
  .object({
    serverId: z.string(),
    repo: z.string().optional(),
    artifact: z.string().optional(),
    revisionId: z.string().optional(),
    config: z.object({
      envs: EnvsSchema.optional(),
      inputs: ServerConfigSchema.optional(),
      rootDir: z.string().optional().default("./"),
    }),
    target: z
      .enum([DeploymentTarget.PREVIEW, DeploymentTarget.PRODUCTION])
      .default(DeploymentTarget.PREVIEW),
  })
  .superRefine((data, ctx) => {
    const hasRepo = !!data.repo;
    const hasArtifact = !!data.artifact;
    const hasRevisionId = !!data.revisionId;

    const count = [hasArtifact, hasRepo, hasRevisionId].filter(Boolean).length;

    if (count === 0) {
      ctx.addIssue({
        code: "custom",
        message:
          "You must provide exactly one of: `repo`, `artifact` or `revisionId`.",
        path: [], // global error
      });
    } else if (count > 1) {
      ctx.addIssue({
        code: "custom",
        message:
          "Only one of `repo`, `artifact` or `revisionId` can be provided at a time.",
        path: [], // global error
      });
    }
  });

app.post(
  "/",
  bearerAuth({ verifyToken: verifyBetterAuthToken }),
  zValidator("json", DeploymentRequest, (result, c) => {
    if (!result.success) {
      c.json(
        {
          error: {
            message: result.error,
            code: ErrorCodeEnum.BAD_REQUEST,
          },
        },
        400,
      );
      return;
    }
  }),
  orgMembership,
  async (c) => {
    const sessionUser = c.get("user");
    const membership = c.get("membership");
    const body = c.req.valid("json");

    try {
      // fetch server details
      // server must exist for owned server deployments and public server deployments
      const server = await Server.fromID({
        callerOrgId: membership.orgId,
        serverId: body.serverId,
      });
      if (!server) {
        c.json(
          {
            error: {
              message: "Server not found or does not allow deployment",
              code: ErrorCodeEnum.NOT_FOUND,
            },
          },
          404,
        );
        return;
      }
      //
      // checks if server belongs to the same organization as the member
      // then deploys server as owner
      // Public server deployments require the `revisionId` for deployments
      const isOwner = membership.orgId === server.org.organizationId;
      if (isOwner) {
        let serverConfig: ServerConfigTable | Nothing = null;
        //
        // upserts server config if provided
        // this overrides the current config
        //
        // The assumption is that user is providing it and intends to update the current config
        // User should be able to update it via server settings if required
        // and omit from the API if doesn't want the mutation.
        //
        // Note: Updating the server config from settings should also trigger re-deployment if existing
        // deployment exists. Here we just do upsert and create new deployment.
        if (body.config) {
          const upsert = {
            id: server.serverId,
            envs: body.config.envs,
            config: body.config.inputs,
            rootDir: body.config.rootDir,
          };
          serverConfig = await Server.upsertConfig(upsert);
        }
        //
        // fetch current server config if not available
        // server config must exist for deployment required by the deployment spec
        if (!serverConfig) {
          serverConfig = await Server.config(server.serverId);
          if (!serverConfig) {
            c.json(
              {
                error: {
                  message: "Error fetching server config",
                  code: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
                },
              },
              400,
            );
            return;
          }
        }

        //
        // Order matters:
        //
        // Treat `repo` with highest priority,
        // next `artifact`, artifact involves uploading sources to storage,
        // least `revisionId`
        // revisionId is when you want to do a re-deployment without build
        //
        // Do deployment for the connected GitHub repository
        if (body.repo) {
          const [parseErr, repo] = parseRepoUrl(body.repo);
          if (parseErr || !repo) {
            c.json(
              {
                error: {
                  message: "GitHub repo not found or is invalid",
                  code: ErrorCodeEnum.NOT_FOUND,
                },
              },
              404,
            );
            return;
          }
          //
          // checks if the org has connected GitHub app
          // for the connected GitHub account
          const ghInstallation = await GitHub.orgInstallation({
            organizationId: membership.orgId,
            githubAppId: env.GITHUB_APP_ID,
            account: repo.owner,
          });
          if (!ghInstallation) {
            c.json(
              {
                error: {
                  message: "GitHub app is not connected",
                  code: ErrorCodeEnum.FORBIDDEN,
                },
              },
              403,
            );
            return;
          }
          //
          // Fetch GitHub repo details to make sure it exists and we still have access
          // Some other details like commit hash is pulled for tracking
          const [repoErr, repoDetails] = await toAsyncErrorValue(() =>
            GitHub.repoDetail({
              githubInstallationId: ghInstallation.githubInstallationId,
              owner: repo.owner,
              repo: repo.repo,
            }),
          );
          if (repoErr || !repoDetails) {
            c.json(
              {
                error: {
                  message: "GitHub repo not found or not allowed",
                  code: ErrorCodeEnum.NOT_FOUND,
                },
              },
              404,
            );
            return;
          }
          const [commitErr, commitHash] = await toAsyncErrorValue(() =>
            GitHub.repoLatestCommitHash({
              githubInstallationId: ghInstallation.githubInstallationId,
              owner: repo.owner,
              repo: repo.repo,
              branch: repoDetails.defaultBranch,
            }),
          );
          const hash = commitErr || !commitHash ? "unknown" : commitHash;

          //
          // make new deployment request
          // for GitHub connected source deployment
          const newRequest: z.infer<typeof DeployWithGitHubRequest> = {
            org: {
              organizationId: membership.orgId,
              name: membership.orgName,
            },
            member: {
              memberId: membership.memberId,
              role: membership.role,
              userId: sessionUser.userId,
              username: sessionUser.username,
            },
            server: {
              serverId: server.serverId,
              title: server.title,
            },
            serverConfig: {
              envs: serverConfig.envs,
              inputs: serverConfig.config,
              configRevision: serverConfig.revision,
              configHash: serverConfig.configHash,
              rootDir: serverConfig.rootDir,
            },
            target: body.target,
            triggerType: TriggerTypeValue.MANUAL,
            githubRepo: repoDetails.name,
            githubOwner: repoDetails.owner.login,
            githubRef: repoDetails.defaultBranch,
            commitHash: hash,
            githubAppId: ghInstallation.githubAppId,
            githubInstallationId: ghInstallation.githubInstallationId,
          };

          const trigger = await ServerDeployment.triggerGitHubBuildDeploy(newRequest);
          c.json(
            {
              deploymentId: trigger.deploymentId,
              buildId: trigger.buildId,
              revisionId: trigger.revisionId,
            },
            200,
          );
          return;
        }
        else if (body.artifact) {
          return c.json(
            {
              error: {
                message: "Not Implemented Yet",
                code: ErrorCodeEnum.BAD_REQUEST,
              },
            },
            400,
          );
        } else if (body.revisionId) {
          return c.json(
            {
              error: {
                message: "Not Implemented Yet",
                code: ErrorCodeEnum.BAD_REQUEST,
              },
            },
            400,
          );
        } else {
          return c.json(
            {
              error: {
                message: "Not Implemented Yet",
                code: ErrorCodeEnum.BAD_REQUEST,
              },
            },
            400,
          );
        }
      } else {
        if (!body.revisionId) {
          return c.json(
            {
              error: {
                message: "Must provide `revisionId` for public deployment",
                code: ErrorCodeEnum.BAD_REQUEST,
              },
            },
            404,
          );
        }
      }
    } catch (err) {
      console.error(err, "Unexpected error on deployment");
      return c.json(
        {
          error: {
            code: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
            message: "Internal server error occurred",
          },
        },
        500,
      );
    }
  },
);

export default app;

