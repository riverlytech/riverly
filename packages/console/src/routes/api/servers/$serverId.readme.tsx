import { createFileRoute } from '@tanstack/react-router'

import { env } from '@riverly/config'
import { Database } from '@riverly/db'
import { Server, Organization, GitHub } from '@riverly/riverly'
import { ServerVisibilityEnum } from '@riverly/ty'

import { auth } from '@/lib/auth'
import type { BetterAuthSession } from '@/lib/auth-types'

export const Route = createFileRoute('/api/servers/$serverId/readme')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const session = (await Database.transaction((db) =>
          auth(db, env).api.getSession({
            headers: request.headers,
          }),
        )) as BetterAuthSession | null
        if (!session) return Response.redirect(new URL('/login', request.url))

        const url = new URL(request.url)
        const { searchParams } = url
        const orgId = searchParams.get('orgId')
        if (!orgId) {
          return new Response('Forbidden', { status: 403 })
        }

        const membership = await Organization.orgMembershipFromID({
          organizationId: orgId,
          userId: session.user.id,
        })
        if (!membership) {
          return new Response('Forbidden', { status: 403 })
        }

        const server = await Server.fromIDWithGit({
          organizationId: orgId,
          serverId: params.serverId,
        })
        if (!server) {
          return Response.json(
            {
              error: {
                message: `Server not found.`,
              },
            },
            { status: 404 },
          )
        }

        // Prefer fetching README directly from the connected GitHub app so both
        // public and private repos work.
        if (server.githubOwner && server.githubRepo) {
          const installation = await GitHub.orgInstallation({
            organizationId: orgId,
            githubAppId: env.GITHUB_APP_ID,
            account: server.githubOwner,
          })

          if (!installation) {
            return new Response('GitHub installation not found', {
              status: 404,
            })
          }

          const readmeContent = await GitHub.repoReadmeContent({
            githubInstallationId: installation.githubInstallationId,
            owner: server.githubOwner,
            repo: server.githubRepo,
          })

          if (readmeContent) {
            return new Response(readmeContent, {
              headers: {
                'Content-Type': 'text/plain; charset=utf-8',
              },
            })
          }
        }

        // Fallback to previously stored README locations if available.
        const readmeUrl =
          server.visibility === ServerVisibilityEnum.PUBLIC
            ? server.readme?.gitDownloadUrl
            : server.readme?.s3Url

        if (!readmeUrl) {
          return new Response(null, { status: 404 })
        }
        const res = await fetch(readmeUrl)
        if (!res.ok) {
          return new Response(null, { status: res.status })
        }
        const text = await res.text()
        return new Response(text, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        })
      },
    },
  },
})
