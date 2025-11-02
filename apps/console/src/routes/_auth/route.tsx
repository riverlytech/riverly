// import { createFileRoute, redirect } from '@tanstack/react-router'
// import { getSessionUser } from '@/lib/auth-server-fn'

// export const Route = createFileRoute('/_auth')({
//   beforeLoad: async () => {
//     const sessionUser = await getSessionUser()
//     if (!sessionUser) throw redirect({ to: '/login/$' })
//     return {
//       sessionUser,
//     }
//   },
// })

import { createFileRoute, redirect } from '@tanstack/react-router'
import { $getSessionUser } from '@/lib/auth-server-fn'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context, preload }) => {
    if (preload) return
    const sessionUser = await $getSessionUser(context.queryClient)
    if (!sessionUser) {
      throw redirect({ to: '/login/$' })
    }
    return {
      sessionUser,
    }
  },
})
