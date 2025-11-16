import { createServerFn, createIsomorphicFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { authMiddleware } from '@/lib/auth-middleware'
import { authClient, toSession as toSessionClient  } from '@/lib/auth-client'
import { auth } from '@/lib/auth'
import { Database } from '@riverly/db'
import { env } from '@riverly/config'
import { toSession } from '@riverly/riverly'
import type { RouterContext } from '@/routes/__root'
import type { BetterAuthSession } from '@/lib/auth-types'

export const getSessionUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(({ context }) => {
    return context.user
  })

export const $getSessionUser = createIsomorphicFn()
  .client(async (queryClient: RouterContext['queryClient']) => {
    const { data: session } = (await queryClient.ensureQueryData({
      queryFn: () => authClient.getSession(),
      queryKey: ['auth', 'getSession'],
      staleTime: 60_000 * 5, // cache for 5 minute
      revalidateIfStale: true, // fetch in background when stale
    })) as { data: BetterAuthSession | null }
    return session
      ? toSessionClient({
          ...session.user,
          image: session.user.image as string,
        })
      : null
  })
  .server(async (_: RouterContext['queryClient']) => {
    const session = (await Database.use((db) =>
      auth(db, env).api.getSession({
        headers: getRequest().headers,
        query: {
          //
          // https://www.better-auth.com/docs/concepts/session-management#session-caching
          disableCookieCache: false,
        },
      }),
    )) as BetterAuthSession | null

    return session
      ? toSession({ ...session.user, image: session.user.image as string })
      : null
  })
