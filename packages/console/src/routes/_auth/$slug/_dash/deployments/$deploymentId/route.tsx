import {
  Link,
  Outlet,
  createFileRoute,
  useMatchRoute,
} from '@tanstack/react-router'
import { Menu, SlashIcon } from 'lucide-react'
import React from 'react'

import { ServerNotFound } from '@/components/commons/notfound'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { orgDeployment } from '@/funcs'


export const Route = createFileRoute(
  '/_auth/$slug/_dash/deployments/$deploymentId',
)({
  beforeLoad: async ({ params: { deploymentId }, context: { membership } }) => {
    const deployment = await orgDeployment({
      data: { organizationId: membership.org.id, deploymentId },
    })
    if (!deployment) throw new Error('Not Found')
    return { deployment }
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
  const { membership, deployment } = Route.useRouteContext()
  const matchRoute = useMatchRoute()
  const slug = membership.org.slug
  const navItems = [
    {
      to: '/$slug/deployments/$deploymentId',
      name: 'Overview',
      exact: true,
      params: { slug, deploymentId: deployment.deploymentId },
    },
    {
      to: '/$slug/deployments/$deploymentId/logs',
      name: 'Logs',
      exact: true,
      params: { slug, deploymentId: deployment.deploymentId },
    },
  ]

  return (
    <div className="p-2 sm:px-4">
      <div className="w-full border-b sticky top-0 z-30 backdrop-blur bg-background/80 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="hidden sm:block w-full">
            <Breadcrumb>
              <BreadcrumbList>
                {[
                  {
                    to: '/$slug/servers/$serverId',
                    label: `${deployment.serverId.slice(0, 4)}...`,
                    params: { slug, serverId: deployment.serverId },
                  },
                  {
                    to: '/$slug/deployments',
                    label: 'Deployments',
                    params: { slug },
                  },
                  {
                    to: '/$slug/deployments/$deploymentId',
                    label: `${deployment.deploymentId.slice(0, 12)}...`,
                    params: { slug, deploymentId: deployment.deploymentId },
                  },
                  {
                    to: '/$slug/deployments/$deploymentId/logs',
                    label: 'Logs',
                    params: { slug, deploymentId: deployment.deploymentId },
                  },
                ].map((crumb, idx) => {
                  const isActive = !!matchRoute({
                    to: crumb.to,
                    params: crumb.params,
                    fuzzy: false,
                  })
                  return (
                    <React.Fragment key={crumb.to}>
                      {idx !== 0 && (
                        <BreadcrumbSeparator>
                          <SlashIcon />
                        </BreadcrumbSeparator>
                      )}
                      <BreadcrumbItem>
                        {isActive ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link
                              to={crumb.to}
                              params={crumb.params}
                              activeOptions={{
                                exact: true,
                                includeSearch: false,
                              }}
                              className="hover:text-foreground"
                            >
                              {crumb.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>

            {/* <NavigationMenu> */}
            {/*   <NavigationMenuList className="flex gap-2"> */}
            {/*     {navItems.map(({ to, name: label, exact, params }) => ( */}
            {/*       <NavigationMenuItem key={to}> */}
            {/*         <NavigationMenuLink asChild> */}
            {/*           <Link */}
            {/*             to={to} */}
            {/*             params={{ ...params }} */}
            {/*             className="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent focus:bg-accent focus:outline-none whitespace-nowrap relative" */}
            {/*             activeOptions={{ exact, includeSearch: false }} */}
            {/*             activeProps={{ */}
            {/*               className: */}
            {/*                 'px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent focus:bg-accent focus:outline-none whitespace-nowrap relative text-foreground after:absolute after:left-0 after:right-0 after:-bottom-2 after:h-0.5 after:bg-primary', */}
            {/*             }} */}
            {/*             inactiveProps={{ */}
            {/*               className: */}
            {/*                 'px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent focus:bg-accent focus:outline-none whitespace-nowrap relative text-muted-foreground hover:text-foreground', */}
            {/*             }} */}
            {/*           > */}
            {/*             {label} */}
            {/*           </Link> */}
            {/*         </NavigationMenuLink> */}
            {/*       </NavigationMenuItem> */}
            {/*     ))} */}
            {/*   </NavigationMenuList> */}
            {/* </NavigationMenu> */}
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
