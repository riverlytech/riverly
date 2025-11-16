import {createIsomorphicFn} from '@tanstack/react-start'

import {membershipServerFn} from '@/funcs/workspace'
import type {RouterContext} from '@/routes/__root'

export const $getWorkspace = createIsomorphicFn()
  .client(
    async (
      queryClient: RouterContext['queryClient'],
      opts: { slug: string },
    ) => {
        return await queryClient.ensureQueryData({
          queryFn: () =>
              membershipServerFn({data: {slug: opts.slug ?? 'undefined'}}),
          queryKey: ['auth', 'workspace'],
          staleTime: 60_000 * 5, // cache for 5 minute
          revalidateIfStale: true, // fetch in background when stale
      })
    },
  )
  .server(async (_: RouterContext['queryClient'], opts: { slug: string }) => {
      return await membershipServerFn({data: {slug: opts.slug}})
  })
