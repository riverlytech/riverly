import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { env } from '@riverly/config'
import { Database } from '@riverly/db'
import { Organization, GitHub } from '@riverly/riverly'
import { GitHubInstallationSetupValue } from '@riverly/ty'

import { auth } from '@/lib/auth'
import type { BetterAuthSession } from '@/lib/auth-types'

const callbackSearchSchema = z.object({
  installationId: z.number(),
  setupAction: z
    .enum([
      GitHubInstallationSetupValue.INSTALL,
      GitHubInstallationSetupValue.UPDATE,
    ])
    .default(GitHubInstallationSetupValue.UPDATE),
})

export const Route = createFileRoute('/api/github/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = (await Database.transaction((db) =>
          auth(db, env).api.getSession({
            headers: request.headers,
          }),
        )) as BetterAuthSession | null
        if (!session) return Response.redirect(new URL('/login', request.url))

        const url = new URL(request.url)
        const { searchParams } = url
        const installationId = searchParams.get('installation_id')
        const setupAction = searchParams.get('setup_action')
        const state = searchParams.get('state')

        const parsedParams = {
          installationId: installationId ? Number(installationId) : undefined,
          setupAction: setupAction ?? undefined,
        }

        if (!state) {
          return new Response('Forbidden', { status: 403 })
        }

        try {
          const membership = await Organization.orgMembershipFromID({
            organizationId: state,
            userId: session.user.id,
          })
          if (!membership) {
            return new Response('Forbidden', { status: 403 })
          }

          const validatedParams = callbackSearchSchema.parse(parsedParams)
          const installationDetails = await GitHub.installationDetails(
            validatedParams.installationId,
          )

          await GitHub.upsertApp({
            organizationId: membership.org.id,
            githubAppId: env.GITHUB_APP_ID,
            githubInstallationId: validatedParams.installationId,
            setupAction: validatedParams.setupAction,
            accountId: installationDetails.accountId,
            accountType: installationDetails.accountType,
            accountLogin: installationDetails.accountLogin,
          })
          return Response.redirect(new URL('/github/installed', request.url))
        } catch (err) {
          console.error(err)
          return new Response('Bad Request', { status: 400 })
        }
      },
    },
  },
})
