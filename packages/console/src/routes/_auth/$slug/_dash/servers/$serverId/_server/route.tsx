import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { ServerNotFound } from '@/components/commons/notfound'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { getServerFromIDWithGitFn } from '@/funcs'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/servers/$serverId/_server',
)({
  beforeLoad: async ({ params, context: { membership } }) => {
    const server = await getServerFromIDWithGitFn({
      data: {
        organizationId: membership.org.id,
        serverId: params.serverId,
      },
    })
    if (!server) throw new Error('Not Found')
    return { server }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not Found') {
      return <ServerNotFound />
    }
    throw error
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { membership, server } = Route.useRouteContext()
  const slug = membership.org.slug
  return (
    <div className="p-2 sm:px-4">
      <div className="w-full border-b sticky top-0 z-30 backdrop-blur bg-background/80 overflow-x-auto py-2">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-2 min-w-max">
            {[
              {
                to: '/$slug/servers/$serverId',
                name: 'Overview',
                exact: true,
                params: { slug, serverId: server.serverId },
              },
              {
                to: '/$slug/servers/$serverId/readme',
                name: 'Readme',
                exact: true,
                params: { slug, serverId: server.serverId },
              },
              {
                to: '/$slug/servers/$serverId/deployments',
                name: 'Deployments',
                exact: false,
                params: { slug, serverId: server.serverId },
              },
              {
                to: '/$slug/servers/$serverId/analytics',
                name: 'Analytics',
                exact: true,
                params: { slug, serverId: server.serverId },
              },
              {
                to: '/$slug/servers/$serverId/settings',
                name: 'Settings',
                exact: true,
                params: { slug, serverId: server.serverId },
              },
            ].map(({ to, name: label, exact, params }) => (
              <NavigationMenuItem key={to}>
                <NavigationMenuLink asChild>
                  <Link
                    to={to}
                    params={{ ...params }}
                    className="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent focus:bg-accent focus:outline-none whitespace-nowrap relative"
                    activeOptions={{ exact, includeSearch: false }}
                    activeProps={{
                      className:
                        'px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent focus:bg-accent focus:outline-none whitespace-nowrap relative text-foreground after:absolute after:left-0 after:right-0 after:-bottom-2 after:h-0.5 after:bg-primary',
                    }}
                    inactiveProps={{
                      className:
                        'px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent focus:bg-accent focus:outline-none whitespace-nowrap relative text-muted-foreground hover:text-foreground',
                    }}
                  >
                    {label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <Outlet />
    </div>
  )
}
