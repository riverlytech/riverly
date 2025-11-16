import { createFileRoute, redirect } from '@tanstack/react-router'
import { $getSessionUser } from '@/lib/auth-server-fn'
import type { SessionUser } from '@riverly/ty'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context, preload }) => {
    if (preload) return
    const sessionUser = (await $getSessionUser(
      context.queryClient,
    )) as SessionUser | null
    if (!sessionUser) {
      throw redirect({ to: '/login/$' })
    }
    return {
      sessionUser,
    }
  },
})
