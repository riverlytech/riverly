import { Link } from '@tanstack/react-router'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  House,
  Server,
  Plus,
  CloudUpload,
  Webhook,
  Lock,
  Globe,
  FlaskConical,
  Rocket,
  ChevronRight,
} from 'lucide-react'
import { GitHubIcon } from '@/components/icons/icons'

export function NavMain({
  username,
  ...props
}: {
  username: string
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              activeOptions={{ exact: true, includeSearch: false }}
              activeProps={{
                className: 'bg-accent',
              }}
              params={{ username }}
              to="/$username"
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  {isActive ? (
                    <>
                      <House className="h-5 w-5" />
                      <span className="font-semibold">Dashboard</span>
                    </>
                  ) : (
                    <>
                      <House className="h-5 w-5 text-muted-foreground" />
                      <span className="font-normal">Dashboard</span>
                    </>
                  )}
                </>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Collapsible asChild defaultOpen>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={'Servers'}>
              <Link
                activeOptions={{ exact: true, includeSearch: false }}
                activeProps={{
                  className: 'bg-accent',
                }}
                params={{ username }}
                to="/$username/servers"
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    {isActive ? (
                      <>
                        <Server className="h-5 w-5" />
                        <span className="font-semibold">Servers</span>
                      </>
                    ) : (
                      <>
                        <Server className="h-5 w-5 text-muted-foreground" />
                        <span className="font-normal">Servers</span>
                      </>
                    )}
                  </>
                )}
              </Link>
            </SidebarMenuButton>
            <>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:rotate-90">
                  <ChevronRight />
                  <span className="sr-only">Toggle</span>
                </SidebarMenuAction>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        activeOptions={{ exact: true, includeSearch: false }}
                        activeProps={{
                          className: 'bg-accent',
                        }}
                        params={{ username }}
                        to="/$username/servers/new"
                      >
                        {({ isActive }: { isActive: boolean }) => (
                          <>
                            {isActive ? (
                              <>
                                <Plus className="h-5 w-5" />
                                <span className="font-semibold">New</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-5 w-5 text-muted-foreground" />
                                <span className="font-normal">New</span>
                              </>
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        activeOptions={{ exact: true, includeSearch: false }}
                        activeProps={{
                          className: 'bg-accent',
                        }}
                        params={{ username }}
                        to="/$username/servers/private"
                      >
                        {({ isActive }: { isActive: boolean }) => (
                          <>
                            {isActive ? (
                              <>
                                <Lock className="h-5 w-5" />
                                <span className="font-semibold">Private</span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-5 w-5 text-muted-foreground" />
                                <span className="font-normal">Private</span>
                              </>
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        activeOptions={{ exact: true, includeSearch: false }}
                        activeProps={{
                          className: 'bg-accent',
                        }}
                        params={{ username }}
                        to="/$username/servers/public"
                      >
                        {({ isActive }: { isActive: boolean }) => (
                          <>
                            {isActive ? (
                              <>
                                <Globe className="h-5 w-5" />
                                <span className="font-semibold">Public</span>
                              </>
                            ) : (
                              <>
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <span className="font-normal">Public</span>
                              </>
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </>
          </SidebarMenuItem>
        </Collapsible>
        <Collapsible asChild defaultOpen>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={'Deployments'}>
              <Link
                activeOptions={{ exact: true, includeSearch: false }}
                activeProps={{
                  className: 'bg-accent',
                }}
                params={{ username }}
                to="/$username/deployments"
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    {isActive ? (
                      <>
                        <CloudUpload className="h-5 w-5" />
                        <span className="font-semibold">Deployments</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="h-5 w-5 text-muted-foreground" />
                        <span className="font-normal">Deployments</span>
                      </>
                    )}
                  </>
                )}
              </Link>
            </SidebarMenuButton>
            <>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:rotate-90">
                  <ChevronRight />
                  <span className="sr-only">Toggle</span>
                </SidebarMenuAction>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        activeOptions={{ exact: true, includeSearch: false }}
                        activeProps={{
                          className: 'bg-accent',
                        }}
                        params={{ username }}
                        to="/$username/deployments/production"
                      >
                        {({ isActive }: { isActive: boolean }) => (
                          <>
                            {isActive ? (
                              <>
                                <Rocket className="h-3 w-3" />
                                <span className="font-semibold">
                                  Production
                                </span>
                              </>
                            ) : (
                              <>
                                <Rocket className="h-3 w-3" />
                                <span className="font-normal">Production</span>
                              </>
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        activeOptions={{ exact: true, includeSearch: false }}
                        activeProps={{
                          className: 'bg-accent',
                        }}
                        params={{ username }}
                        to="/$username/deployments/preview"
                      >
                        {({ isActive }: { isActive: boolean }) => (
                          <>
                            {isActive ? (
                              <>
                                <FlaskConical className="h-3 w-3" />
                                <span className="font-semibold">Preview</span>
                              </>
                            ) : (
                              <>
                                <FlaskConical className="h-3 w-3" />
                                <span className="font-normal">Preview</span>
                              </>
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </>
          </SidebarMenuItem>
        </Collapsible>
        <Collapsible asChild defaultOpen>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={'Settings'}>
              <Link
                activeOptions={{ exact: true, includeSearch: false }}
                activeProps={{
                  className: 'bg-accent',
                }}
                params={{ username }}
                to="/$username/settings"
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    {isActive ? (
                      <>
                        <Server className="h-5 w-5" />
                        <span className="font-semibold">Settings</span>
                      </>
                    ) : (
                      <>
                        <Server className="h-5 w-5 text-muted-foreground" />
                        <span className="font-normal">Settings</span>
                      </>
                    )}
                  </>
                )}
              </Link>
            </SidebarMenuButton>
            <>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:rotate-90">
                  <ChevronRight />
                  <span className="sr-only">Toggle</span>
                </SidebarMenuAction>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        activeOptions={{ exact: true, includeSearch: false }}
                        activeProps={{
                          className: 'bg-accent',
                        }}
                        params={{ username }}
                        to="/$username/settings/github"
                      >
                        {({ isActive }: { isActive: boolean }) => (
                          <>
                            {isActive ? (
                              <>
                                <GitHubIcon className="h-3 w-3" />
                                <span className="font-semibold">GitHub</span>
                              </>
                            ) : (
                              <>
                                <GitHubIcon className="h-3 w-3" />
                                <span className="font-normal">GitHub</span>
                              </>
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        activeOptions={{ exact: true, includeSearch: false }}
                        activeProps={{
                          className: 'bg-accent',
                        }}
                        params={{ username }}
                        to="/$username/settings/webhooks"
                      >
                        {({ isActive }: { isActive: boolean }) => (
                          <>
                            {isActive ? (
                              <>
                                <Webhook className="h-3 w-3" />
                                <span className="font-semibold">Webhooks</span>
                              </>
                            ) : (
                              <>
                                <Webhook className="h-3 w-3" />
                                <span className="font-normal">Webhooks</span>
                              </>
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}
