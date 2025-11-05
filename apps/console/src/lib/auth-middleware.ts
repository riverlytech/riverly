import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import type { BetterAuthSession } from './auth-types'
import { auth } from './auth'
import { env } from '@riverly/app/env'
import { Database } from '@riverly/app/db'
import { toSession } from '@riverly/app'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
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

  return await next({
    context: {
      user: session
        ? toSession({
          ...session.user,
          image: session.user.image as string,
        })
        : null,
    },
  })
})

