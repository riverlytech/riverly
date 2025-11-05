import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_auth/$username/_dash/servers/_list')({
  component: RouteComponent,
})

function RouteComponent() {
  const { workspace } = Route.useRouteContext()
  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex justify-between">
          <div>
            <h1 className="text-2xl mb-2 font-mono font-semibold">Servers</h1>
            <p className="text-muted-foreground">
              Servers from {workspace.username} and other publicly installed
              servers.
            </p>
          </div>
          <Button size="default" asChild>
            <Link
              to="/$username/servers/new"
              params={{ username: workspace.username }}
            >
              Add New
            </Link>
          </Button>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
