import { createFileRoute } from '@tanstack/react-router'

import { UserServerCard } from '@/components/server/preview'
import { orgInstalledServersFn } from '@/funcs'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/servers/_list/private',
)({
  loader: async ({ context: { membership } }) => {
    const servers = await orgInstalledServersFn({
      data: {
        organizationId: membership.org.id,
        limit: 100,
        visibility: 'private',
      },
    })
    return { servers }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { membership } = Route.useRouteContext()
  const { servers } = Route.useLoaderData()
  return (
    <div className="flex flex-col space-y-4 w-full md:w-3/4">
      {servers.length > 0 ? (
        servers.map((server) => (
          <UserServerCard
            key={server.serverId}
            slug={membership.org.slug}
            server={server}
          />
        ))
      ) : (
        <div className="text-muted-foreground">No private servers found.</div>
      )}
    </div>
  )
}
