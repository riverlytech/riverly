import React from 'react'

import {
  Link,
  Outlet,
  createFileRoute,
  useMatchRoute,
} from '@tanstack/react-router'
import { Menu, SlashIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/servers/$serverId/_detail',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { membership, server } = Route.useRouteContext()
  const matchRoute = useMatchRoute()
  const slug = membership.org.slug
  const navItems = [
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
  ]

  return (
    <div className="p-2 sm:px-4">
      <div className="w-full border-b sticky top-0 z-30 backdrop-blur bg-background/80 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="hidden sm:block w-full">
            <Breadcrumb>
              <BreadcrumbList>
                {navItems.map(({ to, name: label, params, exact }, idx) => {
                  const isActive = !!matchRoute({
                    to,
                    params,
                    fuzzy: !exact,
                  })
                  return (
                    <React.Fragment key={to}>
                      {idx !== 0 && (
                        <BreadcrumbSeparator>
                          <SlashIcon />
                        </BreadcrumbSeparator>
                      )}
                      <BreadcrumbItem>
                        {isActive ? (
                          <BreadcrumbPage>{label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link
                              to={to}
                              params={{ ...params }}
                              activeOptions={{ exact, includeSearch: false }}
                              className="hover:text-foreground"
                            >
                              {label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden ml-auto"
                aria-label="Open server navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="sm:hidden w-screen max-w-none h-[calc(100vh-3rem)] rounded-none border-0 p-4 shadow-none bg-background"
            >
              <div className="flex flex-col gap-3">
                {navItems.map(({ to, name: label, exact, params }) => (
                  <Link
                    key={to}
                    to={to}
                    params={{ ...params }}
                    className="block w-full rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-accent focus:bg-accent focus:outline-none text-muted-foreground hover:text-foreground"
                    activeOptions={{ exact, includeSearch: false }}
                    activeProps={{
                      className:
                        'block w-full rounded-md px-3 py-3 text-base font-medium transition-colors bg-accent text-foreground focus:outline-none',
                    }}
                    inactiveProps={{
                      className:
                        'block w-full rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-accent focus:bg-accent focus:outline-none text-muted-foreground hover:text-foreground',
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
