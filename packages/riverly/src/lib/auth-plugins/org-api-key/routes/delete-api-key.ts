import * as z from "zod";
import { APIError, createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { ERROR_CODES } from "..";
import type { apiKeySchema } from "../schema";
import type { ApiKey } from "../ty";
import type { AuthContext } from "better-auth";
import type { PredefinedApiKeyOptions } from ".";
import { API_KEY_TABLE_NAME } from "..";
import { Organization } from "@/services/organization";

export function deleteApiKey({
  opts,
  schema,
  deleteAllExpiredApiKeys,
}: {
  opts: PredefinedApiKeyOptions;
  schema: ReturnType<typeof apiKeySchema>;
  deleteAllExpiredApiKeys(ctx: AuthContext, byPassLastCheckTime?: boolean): void;
}) {
  return createAuthEndpoint(
    "/org-api-key/delete",
    {
      method: "POST",
      body: z.object({
        keyId: z.string().meta({
          description: "The id of the Api Key",
        }),
        organizationId: z.string().meta({
          description: "The id of the Organization",
        }),
      }),
      use: [sessionMiddleware],
      metadata: {
        openapi: {
          description: "Delete an existing API key",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    keyId: {
                      type: "string",
                      description: "The id of the API key to delete",
                    },
                    organizationId: {
                      type: "string",
                      description: "The id of the organization",
                    },
                  },
                  required: ["keyId", "organizationId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "API key deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        description: "Indicates if the API key was successfully deleted",
                      },
                    },
                    required: ["success"],
                  },
                },
              },
            },
          },
        },
      },
    },
    async (ctx) => {
      const { keyId, organizationId } = ctx.body;
      const session = ctx.context.session;
      if (session.user.banned === true) {
        throw new APIError("UNAUTHORIZED", {
          message: ERROR_CODES.USER_BANNED,
        });
      }

      // check for user membership
      const isMember = await Organization.isMember({
        organizationId: organizationId,
        userId: session.user.id,
      });
      if (!isMember) {
        throw new APIError("UNAUTHORIZED", {
          message: ERROR_CODES.INVALID_MEMBER,
        });
      }

      const apiKey = await ctx.context.adapter.findOne<ApiKey>({
        model: API_KEY_TABLE_NAME,
        where: [
          {
            field: "id",
            value: keyId,
          },
          {
            field: "organizationId",
            value: organizationId,
          },
        ],
      });

      if (!apiKey) {
        throw new APIError("NOT_FOUND", {
          message: ERROR_CODES.KEY_NOT_FOUND,
        });
      }

      try {
        await ctx.context.adapter.delete<ApiKey>({
          model: API_KEY_TABLE_NAME,
          where: [
            {
              field: "id",
              value: apiKey.id,
            },
            {
              field: "organizationId",
              value: apiKey.organizationId,
            },
          ],
        });
      } catch (error: any) {
        throw new APIError("INTERNAL_SERVER_ERROR", {
          message: error?.message,
        });
      }
      deleteAllExpiredApiKeys(ctx.context);
      return ctx.json({
        success: true,
      });
    },
  );
}
