import { createFileRoute } from '@tanstack/react-router'

import { ServerNotFound } from '@/components/commons/notfound'
import { getServerFromIDWithGitFn } from '@/funcs'

export const Route = createFileRoute('/_auth/$slug/_dash/servers/$serverId')({
  beforeLoad: async ({ params, context: { membership } }) => {
    const server = await getServerFromIDWithGitFn({
      data: {
        organizationId: membership.org.id,
        serverId: params.serverId,
      },
    })
    if (!server) throw new Error('Not Found')
    return { server }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not Found') {
      return <ServerNotFound />
    }
    throw error
  },
})
