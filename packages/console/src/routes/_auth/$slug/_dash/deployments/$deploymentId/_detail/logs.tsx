import { createFileRoute } from '@tanstack/react-router'

import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/deployments/$deploymentId/_detail/logs',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl font-mono font-semibold">
            Logs
          </h1>
        </div>
        <Card className="max-w-4xl shadow-none">
          <CardContent className="font-thin">
            <p>Coming Soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
