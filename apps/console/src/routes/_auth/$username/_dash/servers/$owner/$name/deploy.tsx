import { GitBranch, AlertCircle } from 'lucide-react'
import { GitHubIcon } from '@/components/icons/icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ServerNotFound } from '@/components/commons/notfound'
import { getServerDetailFromNameFn, githubInstalledRepoDetailFn } from '@/funcs'
import { GitHubDeployFormComponent } from '@/components/deployment/github-deploy-form'

export const Route = createFileRoute(
  '/_auth/$username/_dash/servers/$owner/$name/deploy',
)({
  beforeLoad: async ({ params }) => {
    const { owner, name } = params
    const server = await getServerDetailFromNameFn({
      data: {
        username: owner,
        name,
      },
    })
    if (!server) throw new Error('Not Found')
    return { server }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not Found') {
      return <ServerNotFound />
    }
    throw error
  },
  loader: async ({ context: { server, workspace } }) => {
    if (!server.githubOwner || !server.githubRepo) return { repo: null }
    const repo = await githubInstalledRepoDetailFn({
      data: {
        userId: workspace.userId,
        owner: server.githubOwner,
        name: server.githubRepo,
      },
    })
    return {
      repo,
    }
  },
  component: RouteComponent,
})

export function WebRequireGitConnection() {
  const router = useRouter()

  const handleInstallClick = () => {
    const popup = window.open(
      `${import.meta.env.VITE_GITHUB_APP_INSTALL_URL}`,
      'Installing riverlytech',
      'width=800,height=700,scrollbars=yes,resizable=yes,centerscreen=yes',
    )

    // Listen for when the popup is closed to reload page using TanStack Router.
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        router.invalidate()
      }
    }, 1000)
  }

  return (
    <div className="p-4 border border-destructive/50 hover:border-destructive/70 transition-colors bg-destructive/5 rounded-xl">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="flex-1 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">
            Connect Git Repository
          </span>
        </div>
        <Button
          onClick={handleInstallClick}
          size="sm"
          className="w-full sm:w-auto"
        >
          <GitHubIcon className="mr-2 h-4 w-4" />
          Install
        </Button>
      </div>
      <p className="text-sm mt-3 text-muted-foreground">
        Connect Git Repository to deploy, or use the{' '}
        <span className="font-mono font-medium">CLI</span> for manual deployment
        without Git.
      </p>
    </div>
  )
}

function RouteComponent() {
  const { workspace, server } = Route.useRouteContext()
  const { repo } = Route.useLoaderData()
  return (
    <div className="p-4 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {repo ? (
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-2xl">New Deployment</CardTitle>
              <CardDescription className="text-base">
                Configure your server deployment settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1 rounded-lg border bg-muted/30 px-4 py-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Importing from GitHub
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm font-mono">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <GitHubIcon className="size-4" />
                    {`${repo.owner.login} / ${repo.name}`}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <GitBranch className="size-4" />
                    {server.branch ?? '...'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Riverly Org
                </Label>
                <div className="flex items-center gap-3 rounded-lg border px-3 py-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white">
                      SR
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-medium">{workspace.username}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-medium text-primary">
                      {server.name}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <GitHubDeployFormComponent
                name={`${workspace.username}/${server.name}`}
                repo={`${repo.owner.login}/${repo.name}`}
              />
            </CardContent>
          </Card>
        ) : (
          <WebRequireGitConnection />
        )}
      </div>
    </div>
  )
}
