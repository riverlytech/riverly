import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/$username/_dash/deployments')({
  component: RouteComponent,
})

function RouteComponent() {
  const { username } = Route.useParams()
  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl mb-2 font-mono font-semibold">Deployments</h1>
          <p className="text-muted-foreground">
            All deployments from {username} and public servers
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
