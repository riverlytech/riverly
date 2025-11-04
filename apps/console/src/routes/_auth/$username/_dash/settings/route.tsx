import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_auth/$username/_dash/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { username } = Route.useParams()

  const settingsLinks = [
    {
      id: 1,
      to: '/$username/settings',
      name: 'General',
    },
    {
      id: 2,
      to: '/$username/settings/github',
      name: 'GitHub',
    },
    {
      id: 3,
      to: '/$username/settings/webhooks',
      name: 'Webhooks',
    },
  ]

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl mb-2 font-mono font-semibold">Settings</h1>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
