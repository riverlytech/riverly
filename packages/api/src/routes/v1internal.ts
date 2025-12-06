import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";

import {
  type CloudBuildStatus,
  CloudBuildStatusEnum,
  toDeploymentStatusEnum,
  isTerminalStatus,
} from "@riverly/infra/gcp";
import { ServerDeployment } from "@riverly/riverly";
import { DeploymentStatusEnum } from "@riverly/ty";

import { getApiLogger } from "../lib/logging";

const app = new Hono();
const logger = getApiLogger(["routes", "v1internal"]);

const internalWebhookUsername = process.env.INTERNAL_WEBHOOK_USERNAME || "riverlybot";
const internalWebhookPassword = process.env.INTERNAL_WEBHOOK_PASSWORD || "VeryS3Cure";

app.get("/", (c) => {
  return c.text("Ok");
});

app.post(
  "/deployments/gcp/events",
  basicAuth({
    username: internalWebhookUsername,
    password: internalWebhookPassword,
  }),
  async (c) => {
    const body = await c.req.json();
    const eventId = (body?.context.eventId as string) || null;
    const cbBuildID = (body?.attributes?.buildId as string) || null;
    const cbStatus =
      (body?.attributes?.status as CloudBuildStatus) || CloudBuildStatusEnum.STATUS_UNKNOWN;

    const tags: string[] = body?.build?.tags || [];

    logger.info(
      `Received Event ID: ${eventId ?? "unknown"} for build ID: ${cbBuildID ?? "unknown"}`,
    );

    if (!eventId && !cbBuildID) {
      logger.warn("Ignoring event has missing identifiers");
      return c.json({ ok: false }, 200);
    }

    const deploymentTag = tags.find((tag) => tag.startsWith("deployment-id-"));
    const buildTag = tags.find((tag) => tag.startsWith("build-id-"));
    const eventType = tags.find(
      (tag) => tag === "event-build-n-deploy" || tag === "event-deploy" || tag === "event-build",
    );
    if (!deploymentTag || !buildTag || !eventType) {
      logger.warn(
        `Ignoring event has missing tag(s) 'deployment-id-*', 'build-id-*' or 'event-*' is not set or unavailable`,
      );
      return c.json({ ok: false }, 200);
    }

    const deploymentId = deploymentTag.replace("deployment-id-", "");
    const buildId = buildTag.replace("build-id-", "");
    const status = toDeploymentStatusEnum(cbStatus);
    if (eventType === "event-build-n-deploy") {
      const isTerminal = isTerminalStatus(cbStatus);
      logger.info(`Updating DeploymentID: ${deploymentId} BuildID: ${buildId} Status: ${status}`);

      let finalImageRef: string | null = null;
      let imageDigest: string | null = null;

      if (status === DeploymentStatusEnum.READY) {
        const primaryImageResult =
          (body?.build?.results?.images[0] as {
            name: string;
            digest: string;
          }) || null;
        if (primaryImageResult) {
          finalImageRef = primaryImageResult.name;
          imageDigest = primaryImageResult.digest;
        }
      }

      await ServerDeployment.updateBuildDeploy({
        build: {
          status: status,
          builtAt: isTerminal ? new Date() : undefined,
          imageDigest: imageDigest || undefined,
          imageRef: finalImageRef || undefined,
        },
        deployment: { status: status },
        buildId,
        deploymentId,
      });
    } else if (eventType === "event-build") {
      logger.warn("TODO: handle event-build");
    } else if (eventType === "event-deploy") {
      logger.warn("TODO: handle event-deploy");
    }

    return c.json(
      {
        ok: true,
      },
      200,
    );
  },
);

// const DeploymentLogDrain = z.object({
//   level: z.string().default("info"),
//   deploymentId: z.string(),
//   timestamp: z.number(),
//   msg: z.string().default(""),
// });

// app.post(
//   "/deployments/log",
//   bearerAuth({ verifyToken: verifyInternalServiceToken }),
//   async (c) => {
//     const sessionUser = c.get("user");
//     const body = await c.req.json();
//     const bodyParsed = DeploymentLogDrain.safeParse(body);
//     if (!bodyParsed.success) {
//       return c.json(
//         {
//           error: {
//             message: bodyParsed.error,
//             code: ErrorCode.bad_request,
//           },
//         },
//         200
//       );
//     }

//     const request: z.infer<typeof InsertDeploymentLog> = {
//       userId: sessionUser.userId,
//       deploymentId: bodyParsed.data.deploymentId,
//       message: bodyParsed.data.msg,
//       timestamp: bodyParsed.data.timestamp as unknown as Date, // satisfy TS as zod already does coerce
//       level: bodyParsed.data.level,
//     };
//     const requestParsed = InsertDeploymentLog.safeParse(request);
//     if (!requestParsed.success) {
//       console.error(
//         "[Notify] Bad Request deployment log record. Fix deployment log drain"
//       );
//       return c.json(
//         {
//           error: {
//             message: requestParsed.error,
//             code: ErrorCode.bad_request,
//           },
//         },
//         200
//       );
//     }
//     const logId = await ServerDeployment.ingestLog.force(requestParsed.data);
//     return c.json({ ok: true, logId }, 200);
//   }
// );

export default app;
