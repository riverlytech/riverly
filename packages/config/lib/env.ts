import { createEnv } from "@t3-oss/env-core";
import z from "zod/v4";

const APIKEY_EXPIRES_IN = 60 * 60 * 24 * 365; // 1 year
const APIKEY_PREFIX = "rv-";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),

    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),

    APIKEY_EXPIRES_IN: z.coerce.number().default(APIKEY_EXPIRES_IN),
    APIKEY_PREFIX: z.string().default(APIKEY_PREFIX),

    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),

    BASEURL: z.url(),
    API_BASEURL: z.url(),
    GITHUB_APP_ID: z.coerce.number(),
    GITHUB_PRIVATE_KEY_BASE64: z.string().min(1),

    INTERNAL_WEBHOOK_USERNAME: z.string().min(1),
    INTERNAL_WEBHOOK_PASSWORD: z.string().min(1),

    ELECTRIC_SYNC_BASEURL: z.url(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export type Env = typeof env;
