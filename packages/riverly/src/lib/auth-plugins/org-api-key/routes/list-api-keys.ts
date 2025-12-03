import { APIError, createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import type { apiKeySchema } from "../schema";
import type { ApiKey } from "../ty";
import type { AuthContext } from "better-auth";
import type { PredefinedApiKeyOptions } from ".";
import { safeJSONParse } from "../utils";
import { API_KEY_TABLE_NAME } from "..";
import { ERROR_CODES } from "..";
import z from "zod";
import { Organization } from "../../../../services/organization";

export function listApiKeys({
  opts,
  schema,
  deleteAllExpiredApiKeys,
}: {
  opts: PredefinedApiKeyOptions;
  schema: ReturnType<typeof apiKeySchema>;
  deleteAllExpiredApiKeys(ctx: AuthContext, byPassLastCheckTime?: boolean): void;
}) {
  return createAuthEndpoint(
    "/org-api-key/list",
    {
      method: "GET",
      query: z.object({
        organizationId: z.string().meta({
          description: "The id of the Organization",
        }),
      }),
      use: [sessionMiddleware],
      metadata: {
        openapi: {
          description: "List all API keys for the authenticated user",
          responses: {
            "200": {
              description: "API keys retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description: "ID",
                        },
                        name: {
                          type: "string",
                          nullable: true,
                          description: "The name of the key",
                        },
                        start: {
                          type: "string",
                          nullable: true,
                          description:
                            "Shows the first few characters of the API key, including the prefix. This allows you to show those few characters in the UI to make it easier for users to identify the API key.",
                        },
                        prefix: {
                          type: "string",
                          nullable: true,
                          description: "The API Key prefix. Stored as plain text.",
                        },
                        userId: {
                          type: "string",
                          description: "The owner of the user id",
                        },
                        organizationId: {
                          type: "string",
                          description: "The organization id",
                        },
                        refillInterval: {
                          type: "number",
                          nullable: true,
                          description:
                            "The interval in milliseconds between refills of the `remaining` count. Example: 3600000 // refill every hour (3600000ms = 1h)",
                        },
                        refillAmount: {
                          type: "number",
                          nullable: true,
                          description: "The amount to refill",
                        },
                        lastRefillAt: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                          description: "The last refill date",
                        },
                        enabled: {
                          type: "boolean",
                          description: "Sets if key is enabled or disabled",
                          default: true,
                        },
                        rateLimitEnabled: {
                          type: "boolean",
                          description: "Whether the key has rate limiting enabled",
                        },
                        rateLimitTimeWindow: {
                          type: "number",
                          nullable: true,
                          description: "The duration in milliseconds",
                        },
                        rateLimitMax: {
                          type: "number",
                          nullable: true,
                          description: "Maximum amount of requests allowed within a window",
                        },
                        requestCount: {
                          type: "number",
                          description:
                            "The number of requests made within the rate limit time window",
                        },
                        remaining: {
                          type: "number",
                          nullable: true,
                          description:
                            "Remaining requests (every time api key is used this should updated and should be updated on refill as well)",
                        },
                        lastRequest: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                          description: "When last request occurred",
                        },
                        expiresAt: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                          description: "Expiry date of a key",
                        },
                        createdAt: {
                          type: "string",
                          format: "date-time",
                          description: "created at",
                        },
                        updatedAt: {
                          type: "string",
                          format: "date-time",
                          description: "updated at",
                        },
                        metadata: {
                          type: "object",
                          nullable: true,
                          additionalProperties: true,
                          description: "Extra metadata about the apiKey",
                        },
                        permissions: {
                          type: "string",
                          nullable: true,
                          description: "Permissions for the api key (stored as JSON string)",
                        },
                      },
                      required: [
                        "id",
                        "userId",
                        "organizationId",
                        "enabled",
                        "rateLimitEnabled",
                        "requestCount",
                        "createdAt",
                        "updatedAt",
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (ctx) => {
      const { organizationId } = ctx.query;
      const session = ctx.context.session;

      const isMember = await Organization.isMember({
        organizationId: organizationId,
        userId: session.user.id,
      });
      if (!isMember) {
        throw new APIError("UNAUTHORIZED", {
          message: ERROR_CODES.INVALID_MEMBER,
        });
      }

      let apiKeys = await ctx.context.adapter.findMany<ApiKey>({
        model: API_KEY_TABLE_NAME,
        where: [
          {
            field: "userId",
            value: session.user.id,
          },
          {
            field: "organizationId",
            value: organizationId,
          },
        ],
      });

      deleteAllExpiredApiKeys(ctx.context);
      apiKeys = apiKeys.map((apiKey) => {
        return {
          ...apiKey,
          // @ts-expect-error
          metadata: schema.apikey.fields.metadata.transform.output(
            apiKey.metadata as never as string,
          ),
        };
      }) as ApiKey[];

      let returningApiKey = apiKeys.map((x) => {
        const { key, ...returningApiKey } = x;
        return {
          ...returningApiKey,
          permissions: returningApiKey.permissions
            ? safeJSONParse<{
                [key: string]: string[];
              }>(returningApiKey.permissions)
            : null,
        };
      });

      return ctx.json(returningApiKey);
    },
  );
}
