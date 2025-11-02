import { createFileRoute } from '@tanstack/react-router'
import { GitHub } from '@riverly/app'
import { env } from '@riverly/app/env'
import type { BetterAuthSession } from '@/lib/auth-types'
import { auth } from '@/lib/auth'
import { Database } from '@riverly/app/db'

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
