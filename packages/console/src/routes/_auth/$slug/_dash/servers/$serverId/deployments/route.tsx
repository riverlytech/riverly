import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/servers/$serverId/deployments',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { membership, server } = Route.useRouteContext()
  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl mb-2 font-mono font-semibold">Deployments</h1>
          <p className="text-muted-foreground text-sm">
            Deployments for{' '}
            <span className="font-mono font-semibold text-primary text-sm">
              {`${server.title}`}
            </span>
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 shrink-0">
            <div className="flex flex-col space-y-1">
              <Link
                to="/$slug/servers/$serverId/deployments"
                params={{
                  slug: membership.org.slug,
                  serverId: server.serverId,
                }}
                activeOptions={{ exact: true, includeSearch: false }}
                activeProps={{
                  className:
                    'w-full justify-start bg-accent text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2',
                }}
                inactiveProps={{
                  className:
                    'w-full justify-start hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2',
                }}
              >
                All
              </Link>
              <Link
                to="/$slug/servers/$serverId/deployments/production"
                params={{
                  slug: membership.org.slug,
                  serverId: server.serverId,
                }}
                activeOptions={{ exact: true, includeSearch: false }}
                activeProps={{
                  className:
                    'w-full justify-start bg-accent text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2',
                }}
                inactiveProps={{
                  className:
                    'w-full justify-start hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2',
                }}
              >
                Production
              </Link>
              <Link
                to="/$slug/servers/$serverId/deployments/preview"
                params={{
                  slug: membership.org.slug,
                  serverId: server.serverId,
                }}
                activeOptions={{ exact: true, includeSearch: false }}
                activeProps={{
                  className:
                    'w-full justify-start bg-accent text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2',
                }}
                inactiveProps={{
                  className:
                    'w-full justify-start hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2',
                }}
              >
                Preview
              </Link>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
