import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { jwt, organization } from 'better-auth/plugins'
import { reactStartCookies } from 'better-auth/react-start'

import { type Env } from '@riverly/config'
import {
  Database,
  accounts,
  jwks,
  sessions,
  users,
  verifications,
  organizations,
  members,
  invitations,
} from '@riverly/db'
import { authConfig } from '@riverly/riverly/auth'

export const auth = (
  db: Database.TxOrDb,
  env: Env,
): ReturnType<typeof betterAuth> => {
  return betterAuth({
    appName: 'Riverly',
    ...authConfig,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
        jwks: jwks,
        organization: organizations,
        member: members,
        invitation: invitations,
      },
    }),
    plugins: [
      jwt({
        jwt: {
          issuer: env.BASEURL,
          audience: env.API_BASEURL,
          expirationTime: '90d',
        },
      }),
      organization(),
      reactStartCookies(),
    ],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
  })
}

export type AuthInstance = ReturnType<typeof auth>
