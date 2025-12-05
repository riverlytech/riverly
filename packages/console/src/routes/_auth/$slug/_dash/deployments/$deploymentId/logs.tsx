import { createFileRoute } from '@tanstack/react-router'

// import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/deployments/$deploymentId/logs',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl font-mono font-semibold">Logs</h1>
        </div>
        <div className="flex flex-col space-y-6">
          ...
          {/* <Card className="max-w-4xl shadow-none"> */}
          {/*   <CardContent className="font-thin"> */}
          {/*     <p>Coming Soon...</p> */}
          {/*   </CardContent> */}
          {/* </Card> */}
        </div>
      </div>
    </div>
  )
}
