import { createFileRoute } from '@tanstack/react-router'

import { env } from '@riverly/config'
import { Database } from '@riverly/db'
import { GitHub } from '@riverly/riverly'

import { auth } from '@/lib/auth'
import type { BetterAuthSession } from '@/lib/auth-types'

export const Route = createFileRoute('/api/github/repos')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = (await Database.use((db) =>
          auth(db, env).api.getSession({
            headers: request.headers,
          }),
        )) as BetterAuthSession | null
        if (!session) return Response.redirect(new URL('/login', request.url))

        const { searchParams } = new URL(request.url)
        const owner = searchParams.get('owner') ?? session.user.username

        const ghAppInstall = await GitHub.userInstallation({
          userId: session.user.id,
          githubAppId: env.GITHUB_APP_ID,
          account: owner,
        })

        if (!ghAppInstall || !ghAppInstall.githubInstallationId) {
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
