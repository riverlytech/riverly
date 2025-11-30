import { Storage } from "@google-cloud/storage";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";

import { Server } from "@riverly/riverly";
import { ServerModeEnum } from "@riverly/ty";

import { ErrorCodeEnum } from "./errors";
import { verifyBetterAuthToken, orgMembership } from "../middlewares/middlewares";

const app = new Hono();

const artifactBucket = process.env.ARTIFACT_BUCKET!;

const artifactSchema = z.object({
  serverId: z.string(),
  suffix: z.string().default("tar.gz"), // defaults to .tar.gz compression (set by `riverlytech/cli`)
  version: z.string().optional().default("latest"), // defaults to latest
});

app.post(
  "/",
  bearerAuth({ verifyToken: verifyBetterAuthToken }),
  zValidator("json", artifactSchema, (result, c) => {
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

    const ownedServer = await Server.ownedServer({
      organizationId: membership.orgId,
      serverId: body.serverId,
    });
    if (!ownedServer) {
      return c.json(
        {
          error: {
            code: ErrorCodeEnum.NOT_FOUND,
            message: "Server not found",
          },
        },
        404,
      );
    }

    if (ownedServer.mode === ServerModeEnum.LOCAL) {
      return c.json(
        {
          error: {
            code: ErrorCodeEnum.FORBIDDEN,
            message: "Local server cannot be deployed",
          },
        },
        403,
      );
    }

    // use sha-like hash for caching and dedup
    const storage = new Storage();

    // absolutePath:
    // <userId>/<serverId>:<version>.<suffix>

    // NOTE:
    // compression suffix as set by client (cli): `riverlytech/cli`
    // must also implement said compression.
    const absolutePath = `${sessionUser.userId}/servers/${ownedServer.id}:${body.version}.${body.suffix}`;
    const expires = Date.now() + 60 * 60 * 1000;

    const [url] = await storage
      .bucket(artifactBucket)
      .file(absolutePath)
      .getSignedUrl({
        action: "write",
        contentType: "application/octet-stream",
        expires,
      });

    return c.json({
      uploadUrl: url,
      expires,
      artifact: absolutePath,
    });
  },
);

export default app;

