import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/deployments/$deploymentId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { membership } = Route.useRouteContext()
  return (
    <div className="flex-1">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-2 sm:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="mr-1">
            <Link
              to={'/$slug'}
              params={{ slug: membership.org.slug }}
              className="font-mono"
            >
              riverly.
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1.5 pb-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <a
                    href="https://docs.riverly.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2"
                  >
                    Docs
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <a
                    href="https://blog.riverly.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2"
                  >
                    Blog
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="px-3 py-2">
                        Feedback
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Give feedback</DialogTitle>
                        <DialogDescription>
                          We&apos;d love to hear what went well or how we can
                          improve the product experience.
                        </DialogDescription>
                      </DialogHeader>
                      {/* Replace this with your feedback form or content */}
                      <div className="mt-4">
                        <textarea
                          className="w-full border rounded-md p-2 text-sm"
                          rows={4}
                          placeholder="Your feedback"
                        />
                        <Button className="mt-2">Submit</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full hover:bg-alpha-400 focus:bg-alpha-400 size-fit border-0 p-0.5"
              >
                ...
                {/* <Avatar className="size-6">
                  <AvatarImage src={image} alt={username} />
                  <AvatarFallback>{username[0]}</AvatarFallback>
                </Avatar> */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{membership.user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/$slug" params={{ slug: membership.org.slug }}>
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/$slug/settings"
                  params={{ slug: membership.org.slug }}
                >
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="w-full border-b sticky top-0 z-30 backdrop-blur bg-background/80 overflow-x-auto pb-2">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-2 px-4 pt-2 sm:px-8 min-w-max">
            {[
              {
                to: '/$slug/deployments/$deploymentId',
                name: 'Deployment',
                exact: true,
              },
              {
                to: '/$slug/deployments/$deploymentId/logs',
                name: 'Logs',
                exact: true,
              },
            ].map(({ to, name, exact }) => (
              <NavigationMenuItem key={to}>
                <NavigationMenuLink asChild>
                  <Link
                    to={to}
                    params={{ slug: membership.org.slug }}
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
                    {name}
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
