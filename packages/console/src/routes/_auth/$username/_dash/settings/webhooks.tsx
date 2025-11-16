import { createFileRoute } from '@tanstack/react-router'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute(
  '/_auth/$username/_dash/settings/webhooks',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col space-y-4 w-full md:w-3/4">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="font-thin">
          <p>Coming Soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
