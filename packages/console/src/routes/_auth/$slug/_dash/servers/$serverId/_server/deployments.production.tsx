import { createFileRoute } from '@tanstack/react-router'

import { DeploymentPreview } from '@/components/deployment/preview'
import { serverDeploymentsFn } from '@/funcs'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/servers/$serverId/_server/deployments/production',
)({
  loader: async ({ context: { server, membership } }) => {
    const deployments = await serverDeploymentsFn({
      data: {
        organizationId: membership.org.id,
        serverId: server.serverId,
        limit: 100,
        target: 'production',
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
