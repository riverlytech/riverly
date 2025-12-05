import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/$slug/_dash/settings/apikeys')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/$slug/_dash/settings/apikeys"!</div>
}
