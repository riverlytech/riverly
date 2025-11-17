import { createFileRoute, redirect } from '@tanstack/react-router'

import type { SessionUser } from '@riverly/ty'

import { $getSessionUser } from '@/lib/auth-server-fn'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context, preload }) => {
    if (preload) return
    const sessionUser = (await $getSessionUser(
      context.queryClient,
    )) as SessionUser | null
    if (!sessionUser) {
      console.log(sessionUser)
      console.log('********* WHY IS THIS HAPPENING ***********')
      throw redirect({ to: '/login' })
    }
    return {
      sessionUser,
    }
  },
})
