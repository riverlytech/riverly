import { createFileRoute } from '@tanstack/react-router'

import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute(
  '/_auth/$username/_dash/servers/$owner/$name/_server/analytics',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl mb-2 font-mono font-semibold">Analytics</h1>
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
