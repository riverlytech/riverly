import { createFileRoute } from '@tanstack/react-router'
import { Server } from '@riverly/riverly'
import { ServerVisibilityEnum } from '@riverly/ty'
import type { BetterAuthSession } from '@/lib/auth-types'
import { auth } from '@/lib/auth'
import { env } from '@riverly/config'
import { Database } from '@riverly/db'

export const Route = createFileRoute('/api/servers/$username/$name/readme')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const session = (await Database.use((db) =>
          auth(db, env).api.getSession({
            headers: request.headers,
          }),
        )) as BetterAuthSession | null
        if (!session) return Response.redirect(new URL('/login', request.url))
        const { username, name } = params

        const server = await Server.fromName({
          callerUserId: session.user.id,
          username,
          name,
        })

        if (!server) {
          return Response.json(
            {
              error: {
                message: `Server not found for ${username}/${name}`,
              },
            },
            { status: 404 },
          )
        }

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
            'Content-Type': 'text/plain',
          },
        })
      },
    },
  },
})
