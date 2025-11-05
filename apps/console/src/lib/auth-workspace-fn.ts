import { createIsomorphicFn } from '@tanstack/react-start'
import type { RouterContext } from '@/routes/__root'
import { membershipServerFn } from '@/funcs/workspace'

export const $getWorkspace = createIsomorphicFn()
  .client(
    async (
      queryClient: RouterContext['queryClient'],
      opts: { slug: string },
    ) => {
      const workspace = await queryClient.ensureQueryData({
        queryFn: () =>
          membershipServerFn({ data: { slug: opts.slug ?? 'undefined' } }),
        queryKey: ['auth', 'workspace'],
        staleTime: 60_000 * 5, // cache for 5 minute
        revalidateIfStale: true, // fetch in background when stale
      })
      return workspace
    },
  )
  .server(async (_: RouterContext['queryClient'], opts: { slug: string }) => {
    const workspace = await membershipServerFn({ data: { slug: opts.slug } })
    return workspace
  })
