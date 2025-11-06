import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

export const Route = createFileRoute(
  '/_auth/$username/_dash/servers/$owner/$name/_server',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { username, owner, name } = Route.useParams()
  return (
    <div className="px-4">
      <div className="w-full border-b sticky top-0 z-30 backdrop-blur bg-background/80 overflow-x-auto pb-2">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-2 min-w-max">
            {[
              {
                to: '/$username/servers/$owner/$name',
                name: 'Overview',
                exact: true,
                params: { username, owner, name },
              },
              {
                to: '/$username/servers/$owner/$name/readme',
                name: 'Readme',
                exact: true,
                params: { username, owner, name },
              },
              {
                to: '/$username/servers/$owner/$name/deployments',
                name: 'Deployments',
                exact: false,
                params: { username, owner, name },
              },
              {
                to: '/$username/servers/$owner/$name/analytics',
                name: 'Analytics',
                exact: true,
                params: { username, owner, name },
              },
              {
                to: '/$username/servers/$owner/$name/settings',
                name: 'Settings',
                exact: true,
                params: { username, owner, name },
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
