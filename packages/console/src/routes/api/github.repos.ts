import { createFileRoute } from '@tanstack/react-router'

import { env } from '@riverly/config'
import { Database } from '@riverly/db'
import { GitHub, Organization } from '@riverly/riverly'

import { auth } from '@/lib/auth'
import type { BetterAuthSession } from '@/lib/auth-types'

export const Route = createFileRoute('/api/github/repos')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = (await Database.transaction((db) =>
          auth(db, env).api.getSession({
            headers: request.headers,
          }),
        )) as BetterAuthSession | null
        if (!session) return Response.redirect(new URL('/login', request.url))

        const { searchParams } = new URL(request.url)
        const organizationId = searchParams.get('organizationId')
        const owner = searchParams.get('owner')
        if (!organizationId || !owner) {
          return Response.json({ isInstalled: false, repos: [] }, { status: 400 })
        }

        const membership = await Organization.orgMembershipFromID({
          organizationId: organizationId,
          userId: session.user.id,
        })
        if (!membership) {
          return Response.json({ isInstalled: false, repos: [] }, { status: 403 })
        }

        const ghAppInstall = await GitHub.orgInstallation({
          organizationId: membership.org.id,
          githubAppId: env.GITHUB_APP_ID,
          account: owner,
        })
        if (!ghAppInstall) {
          return Response.json({
            isInstalled: false,
            repos: [],
          })
        }
        const repos = await GitHub.repos(ghAppInstall.githubInstallationId)
        return Response.json({
          isInstalled: true,
          repos,
        })
      },
    },
  },
})
