import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import type { BetterAuthSession } from './auth-types'
import { auth } from './auth'
import { env } from '@riverly/config'
import { Database } from '@riverly/db'
import { toSession } from '@riverly/riverly'

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

  return next({
      context: {
          user: session
              ? toSession({
                  ...session.user,
                  image: session.user.image as string,
              })
              : null,
      },
  });
})

export const jwtToken = createMiddleware().server(async ({ next }) => {
  let token: string | null = null

  try {
    const response = await fetch('/api/auth/token', {
      headers: getRequest().headers,
    })

    if (response.ok) {
      const data = await response.json()
      token = data.token ?? null
    }
  } catch (error) {
    console.error(error)
    token = null
  }

  return next({
      context: {
          token,
      },
  });
})
