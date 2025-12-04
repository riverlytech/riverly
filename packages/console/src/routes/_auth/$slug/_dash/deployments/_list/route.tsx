import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/$slug/_dash/deployments/_list')({
  component: RouteComponent,
})

function RouteComponent() {
  const { membership } = Route.useRouteContext()
  return (
    <div className="p-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl mb-2 font-mono font-semibold">Deployments</h1>
          <p className="text-muted-foreground">
            All deployments from {membership.org.slug} and public servers
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
