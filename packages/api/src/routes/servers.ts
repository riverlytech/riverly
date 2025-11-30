import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";

import { env } from "@riverly/config";
import { AddServer } from "@riverly/db";
import { Server } from "@riverly/riverly";

import { ErrorCodeEnum } from "./errors";
import { verifyBetterAuthToken, orgMembership } from "../middlewares/middlewares";

const app = new Hono();

const AddServerRequest = AddServer.omit({
  organizationId: true,
  memberId: true,
  image: true,
})
  .required()
  .extend({
    image: z.url().optional(),
    repoUrl: z.string().optional(),
  });

app.post(
  "/",
  bearerAuth({ verifyToken: verifyBetterAuthToken }),
  zValidator("json", AddServerRequest, (result, c) => {
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
    const body = c.req.valid("json");
    const membership = c.get("membership");
    const baseRequest = {
      organizationId: membership.orgId,
      memberId: membership.memberId,
      title: body.title,
      description: body.description,
      repoUrl: body.repoUrl,
      visibility: body.visibility,
    };

    if (body.repoUrl) {
      const result = await Server.importFromGitHub({
        ...baseRequest,
        repoUrl: body.repoUrl as string,
        githubAppId: env.GITHUB_APP_ID,
      });
      return c.json({
        serverId: result.id,
        title: result.title,
        description: result.description,
        visibility: result.visibility,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      });
    } else {
      const result = await Server.addNew({ ...baseRequest });
      return c.json({
        serverId: result.id,
        title: result.title,
        description: result.description,
        visibility: result.visibility,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      });
    }
  },
);

export default app;
