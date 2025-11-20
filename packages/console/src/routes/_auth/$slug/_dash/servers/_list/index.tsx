import { createFileRoute } from '@tanstack/react-router'

import { DeployYourOwn } from '@/components/server/deploy-your-own'
import { UserServerCard } from '@/components/server/preview'
import { orgInstalledServersFn } from '@/funcs'

export const Route = createFileRoute('/_auth/$slug/_dash/servers/_list/')({
  loader: async ({ context: { membership } }) => {
    const servers = await orgInstalledServersFn({
      data: {
        organizationId: membership.org.id,
        limit: 100,
        visibility: 'both',
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
        <DeployYourOwn />
      )}
    </div>
  )
}
