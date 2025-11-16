import { createFileRoute, Outlet } from '@tanstack/react-router'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dash/app-sidebar'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_auth/$username/_dash')({
  component: RouteComponent,
})

function RouteComponent() {
  const { workspace } = Route.useRouteContext()
  return (
    <SidebarProvider>
      <AppSidebar username={workspace.username} />
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
