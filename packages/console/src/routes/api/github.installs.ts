import { createFileRoute } from '@tanstack/react-router'

import { env } from '@riverly/config'
import { Database } from '@riverly/db'
import { GitHub, Organization } from '@riverly/riverly'

import { auth } from '@/lib/auth'
import type { BetterAuthSession } from '@/lib/auth-types'

export const Route = createFileRoute('/api/github/installs')({
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
        if (!organizationId) {
          return Response.json({ installs: [] }, { status: 400 })
        }

        const membership = await Organization.orgMembershipFromID({
          organizationId: organizationId,
          userId: session.user.id,
        })
        if (!membership) {
          return Response.json(
            { isInstalled: false, repos: [] },
            { status: 403 },
          )
        }

        const installs = await GitHub.orgInstalls({
          organizationId: membership.org.id,
          githubAppId: env.GITHUB_APP_ID,
        })
        return Response.json({
          installs,
        })
      },
    },
  },
})
