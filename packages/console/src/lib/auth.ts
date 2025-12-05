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
  apikey
} from '@riverly/db'
import { Organization } from '@riverly/riverly'
import { authConfig } from '@riverly/riverly/auth'
import { orgApiKey } from '@riverly/riverly/auth/org-api-key'
import { genId } from '@riverly/utils'

import type { AuthenticatedUser } from './auth-types'

export const auth = (db: Database.TxOrDb, env: Env) => {
  return betterAuth({
    appName: 'Riverly',
    ...authConfig,
    database: drizzleAdapter(db, {
      provider: 'pg',
      transaction: true,
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
          expirationTime: '90d',
        },
      }),
      organization(),
      orgApiKey(),
      reactStartCookies(),
    ],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user, _) => {
            const authUser = user as AuthenticatedUser
            if (authUser.defaultOrgId) return
            const values = {
              name: `${user.name}`,
              slug: `${user.username}-${genId(4)}`,
            }
            const org = await Organization.createDefaultOrg({
              org: values,
              userId: user.id,
            })
            console.log(
              `[Org] default created: ${org.organizationId} memberId: ${org.memberId}`,
            )
          },
        },
      },
      session: {
        create: {
          after: async () => { },
        },
      },
    },
  })
}

export type AuthInstance = ReturnType<typeof auth>
