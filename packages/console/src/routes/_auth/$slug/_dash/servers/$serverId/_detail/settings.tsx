import { createFileRoute } from '@tanstack/react-router'

import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/servers/$serverId/_detail/settings',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { server } = Route.useRouteContext()
  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl mb-2 font-mono font-semibold">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Configure settings for{' '}
            <span className="font-mono font-semibold text-primary text-sm">
              {`${server.title}(${server.serverId})`}
            </span>
          </p>
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
