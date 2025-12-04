import { createFileRoute } from '@tanstack/react-router'

import { WithClient } from '@/components/commons/with-client'
// import { DeploymentLogs } from '@/components/deployment/deployment-logs'
// import { DeploymentDetail } from '@/components/deployment/detail'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/deployments/$deploymentId/_detail/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl font-mono font-semibold">
            Deployment Details
          </h1>
        </div>
        <div className="flex flex-col space-y-6">
          ...
          {/* <DeploymentDetail username={username} deployment={deployment} /> */}
          <WithClient>
            ...
            {/* <DeploymentLogs
              userId={workspace.userId}
              deploymentId={deploymentId}
            /> */}
          </WithClient>
        </div>
      </div>
    </div>
  )
}
