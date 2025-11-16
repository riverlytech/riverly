import { createFileRoute } from '@tanstack/react-router'

import { DeployYourOwn } from '@/components/server/deploy-your-own'
import { UserServerCard } from '@/components/server/preview'
import { userInstalledServersFn } from '@/funcs'

export const Route = createFileRoute('/_auth/$username/_dash/servers/_list/')({
  loader: async ({ context }) => {
    const servers = await userInstalledServersFn({
      data: {
        userId: context.sessionUser.userId,
        limit: 100,
        visibility: 'both',
      },
    })
    return { servers }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { workspace } = Route.useRouteContext()
  const { servers } = Route.useLoaderData()
  return (
    <div className="flex flex-col space-y-4 w-full md:w-3/4">
      {servers.length > 0 ? (
        servers.map((server) => (
          <UserServerCard
            key={server.serverId}
            username={workspace.username}
            server={server}
          />
        ))
      ) : (
        <DeployYourOwn />
      )}
    </div>
  )
}
