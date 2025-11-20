import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AppSidebar } from '@/components/dash/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export const Route = createFileRoute('/_auth/$slug/_dash')({
  component: RouteComponent,
})

function RouteComponent() {
  const { membership } = Route.useRouteContext()
  return (
    <SidebarProvider>
      <AppSidebar slug={membership.org.slug} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
