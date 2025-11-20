import { createFileRoute } from '@tanstack/react-router'

import { env } from '@riverly/config'
import { Database } from '@riverly/db'

import { auth } from '@/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) =>
        Database.transaction((db) => auth(db, env).handler(request)),
      POST: ({ request }) =>
        Database.transaction((db) => auth(db, env).handler(request)),
    },
  },
})
