import { createFileRoute } from '@tanstack/react-router'

import { env } from '@riverly/config'
import { Database } from '@riverly/db'

import { auth } from '@/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) =>
        Database.use((db) => auth(db, env).handler(request)),
      POST: ({ request }) =>
        Database.use((db) => auth(db, env).handler(request)),
    },
    // handlers: {
    //   GET: ({ request }) => Database.use(() => auth.handler(request)),
    //   POST: ({ request }) => Database.use(() => auth.handler(request)),
    // },
    // handlers: {
    //   GET: ({ request }) => {
    //     return auth.handler(request)
    //   },
    //   POST: ({ request }) => {
    //     return auth.handler(request)
    //   },
    // },
  },
})
