import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_auth/$slug/_dash/servers/_list')({
  component: RouteComponent,
})

function RouteComponent() {
  const { membership } = Route.useRouteContext()
  return (
    <div className="p-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex justify-between">
          <div>
            <h1 className="text-2xl mb-2 font-mono font-semibold">Servers</h1>
            <p className="text-muted-foreground">
              Servers from {membership.org.slug} and other publicly installed
              servers.
            </p>
          </div>
          <Button size="default" asChild>
            <Link
              to="/$slug/servers/new"
              params={{ slug: membership.org.slug }}
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
