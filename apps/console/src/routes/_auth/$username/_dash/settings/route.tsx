import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/$username/_dash/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl mb-2 font-mono font-semibold">Settings</h1>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
