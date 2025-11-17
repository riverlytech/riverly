import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";

import { type Env } from "@riverly/config";
import { Database } from "@riverly/db";
import { users, sessions, accounts, verifications, jwks } from "@riverly/db";
import { authConfig } from "@riverly/riverly/auth";

export const auth = (
  db: Database.TxOrDb,
  env: Env
): ReturnType<typeof betterAuth> => {
  return betterAuth({
    appName: "Riverly",
    ...authConfig,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
        jwks: jwks,
      },
    }),
    plugins: [
      jwt({
        jwt: {
          issuer: env.BASEURL,
          audience: env.API_BASEURL,
          expirationTime: "90d",
        },
      }),
    ],
  });
};

export type AuthInstance = ReturnType<typeof auth>;
