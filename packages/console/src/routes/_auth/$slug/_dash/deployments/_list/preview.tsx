import { createFileRoute } from '@tanstack/react-router'

import { DeploymentPreview } from '@/components/deployment/preview'
import { deploymentsFn } from '@/funcs'

export const Route = createFileRoute('/_auth/$slug/_dash/deployments/_list/preview')({
  loader: async ({ context: { membership } }) => {
    const deployments = await deploymentsFn({
      data: {
        organizationId: membership.org.id,
        limit: 100,
        target: 'preview',
      },
    })
    return { deployments }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { deployments } = Route.useLoaderData()
  return (
    <div className="flex flex-col space-y-4 w-full md:w-3/4">
      {deployments.length > 0 ? (
        deployments.map((deployment) => (
          <DeploymentPreview
            key={deployment.deploymentId}
            deployment={deployment}
          />
        ))
      ) : (
        <div className="text-muted-foreground">
          No deployments match the current filters.
        </div>
      )}
    </div>
  )
}
