import { createFileRoute } from '@tanstack/react-router'

import { GitHubIcon } from '@/components/icons/icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { orgGitHubInstallationsFn } from '@/funcs'

export const Route = createFileRoute('/_auth/$slug/_dash/settings/github')({
  loader: async ({ context: { membership } }) => {
    const installations = await orgGitHubInstallationsFn({
      data: { organizationId: membership.org.id },
    })
    return {
      installations,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { membership } = Route.useRouteContext()
  const { installations } = Route.useLoaderData()
  const totalInstallations = installations?.length ?? 0
  const limitedInstallations = installations?.slice(0, 3) ?? []

  return (
    <div className="flex flex-col space-y-4 w-full md:w-3/4">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>GitHub Connect</CardTitle>
          <CardDescription>
            Connect your GitHub account to sync repositories and enable advanced
            features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <GitHubIcon className="h-4 w-4" />
              {limitedInstallations.length ? (
                <span className="text-sm">
                  {limitedInstallations
                    .map((install) => install.accountLogin)
                    .join(', ')}
                  {totalInstallations > 3 ? ` +${totalInstallations - 3} more` : ''}
                </span>
              ) : (
                <span className="text-sm">No GitHub accounts connected</span>
              )}
            </div>

            {installations && installations.length > 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">
                    GitHub Connected
                  </span>
                </div>
                <a
                  href={`${import.meta.env.VITE_GITHUB_APP_INSTALL_URL}?state=${membership.org.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  <span className="hidden sm:inline font-normal">
                    Adjust GitHub App permissions →
                  </span>
                  <span className="sm:hidden font-normal">
                    Adjust Permissions →
                  </span>
                </a>
              </div>
            ) : (
              <Button
                asChild
                variant="default"
                className="gap-2 w-full sm:w-auto"
              >
                <a
                  href={`${import.meta.env.VITE_GITHUB_APP_INSTALL_URL}?state=${membership.org.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon className="h-4 w-4" />
                  Connect GitHub
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
