import { createFileRoute } from '@tanstack/react-router'

import { EditOrgNameForm, EditOrgSlugForm } from '@/components/organization/edit-org-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/_auth/$slug/_dash/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { membership } = Route.useRouteContext()
  return (
    <div className="flex flex-col space-y-4 w-full md:w-3/4">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Org Name</CardTitle>
          <CardDescription>
            This is your org's visible name within Riverly. For example, the name of your company or department.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditOrgNameForm organizationId={membership.org.id} defaultName={membership.org.name} />
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Org Slug</CardTitle>
          <CardDescription>
            This is your org's URL namespace on Riverly. Within it, your team can inspect their servers, check out any recent activity, or configure settings to their liking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditOrgSlugForm organizationId={membership.org.id} defaultName={membership.org.slug} />
        </CardContent>
      </Card>
    </div>
  )
}
