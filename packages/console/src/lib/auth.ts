import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { jwt, organization } from 'better-auth/plugins'
import { reactStartCookies } from 'better-auth/react-start'

import { Organization } from "@riverly/riverly"
import { genId } from '@riverly/utils'

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
) => {
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
    databaseHooks: {
      user: {
        create: {
          after: async (user, _) => {
            const values = {
              name: `${user.name}`,
              slug: `${user.username}-${genId(4)}`,
            }
            const org = await Organization.createOrgWithOwnership({ org: values, userId: user.id })
            console.log(`[Org] created: ${org.organizationId} memberId: ${org.memberId}`)
          }
        }
      }
    }
  })
}

export type AuthInstance = ReturnType<typeof auth>

