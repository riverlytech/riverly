import { createFileRoute } from '@tanstack/react-router'
import { ServerNotFound } from '@/components/commons/notfound'
import { orgDeployment } from '@/funcs'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/deployments/$deploymentId',
)({
  beforeLoad: async ({ params: { deploymentId }, context: { membership } }) => {
    const deployment = await orgDeployment({
      data: { organizationId: membership.org.id, deploymentId },
    })
    if (!deployment) throw new Error('Not Found')
    return { deployment }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not Found') {
      return <ServerNotFound />
    }
    throw error
  },
})

