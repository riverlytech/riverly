import { env } from "@riverly/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { orgApiKey } from "./auth-plugins/org-api-key";

import {
  Database,
  users,
  sessions,
  accounts,
  verifications,
  jwks,
  organizations,
  members,
  invitations,
  apikey
} from "@riverly/db";

export const authConfig = {
  emailAndPassword: {
    enabled: false,
    requireEmailVerification: false,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,

      mapProfileToUser: (profile: any) => {
        return {
          name: profile.name || profile.login,
          email: profile.email,
          username: profile.login,
          image: profile.avatar_url,
        };
      },
    },
  },
  user: {
    additionalFields: {
      username: { type: "string", required: false, input: true },
      defaultOrgId: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
    },
  },
} as const;

export const auth = betterAuth({
  appName: "Riverly",
  ...authConfig,
  database: drizzleAdapter(Database.db(), {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
      jwks: jwks,
      organization: organizations,
      member: members,
      invitation: invitations,
      apikey: apikey
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
    organization(),
    orgApiKey(),
  ],
});
