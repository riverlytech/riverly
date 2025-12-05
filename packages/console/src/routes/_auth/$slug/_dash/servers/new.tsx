import { createFileRoute } from '@tanstack/react-router'

import { GitHubSelectRepo } from '@/components/commons/github-select-repo'
import { AddServerForm } from '@/components/server/add-server-form'

export const Route = createFileRoute('/_auth/$slug/_dash/servers/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const { membership } = Route.useRouteContext()
  return (
    <div className="p-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-mono font-semibold">Add new Server</h1>
        </div>
        <div className="flex flex-col max-w-3xl space-y-6">
          <GitHubSelectRepo
            organizationId={membership.org.id}
            slug={membership.org.slug}
          />
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <div className="text-sm text-muted-foreground">OR</div>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          <AddServerForm
            slug={membership.org.slug}
            organizationId={membership.org.id}
            memberId={membership.id}
          />
        </div>
      </div>
    </div>
  )
}
