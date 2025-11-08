import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/$username/_dash/servers/$owner/$name/deploy',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_auth/$username/_dash/servers/$owner/$name/_server/deploy"!
    </div>
  )
}
