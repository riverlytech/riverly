import { createFileRoute } from '@tanstack/react-router'
import { AlertCircleIcon, GitBranch } from 'lucide-react'

import { GitHubIcon } from '@/components/icons/icons'
import { GitHubImportServerForm } from '@/components/server/github-import-server'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { githubInstalledRepoDetailFn } from '@/funcs'

type ImportRepoSearch = {
  owner?: string
  name?: string
}

export const Route = createFileRoute('/_auth/$username/_dash/servers/import')({
  validateSearch: (search: Record<string, unknown>): ImportRepoSearch => {
    return {
      name: (search.name as string) || undefined,
      owner: (search.owner as string) || undefined,
    }
  },
  loaderDeps: ({ search: { name, owner } }) => ({
    name,
    owner,
  }),
  loader: async ({ deps, context: { workspace } }) => {
    let repo: Awaited<ReturnType<typeof githubInstalledRepoDetailFn>> | null =
      null
    const owner = deps.owner || workspace.username
    const name = deps.name
    if (name) {
      repo = await githubInstalledRepoDetailFn({
        data: { userId: workspace.userId, owner: owner, name: name },
      })
    }
    return {
      repo,
      owner,
      name,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { workspace } = Route.useRouteContext()
  const { repo, owner, name } = Route.useLoaderData()
  return (
    <div className="p-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-mono font-semibold">
            Import from GitHub
          </h1>
        </div>
        <div className="flex flex-col max-w-3xl space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <div className="flex flex-col p-4 bg-accent rounded-xl gap-2">
                <div className="text-xs">importing from GitHub</div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <GitHubIcon className="w-4 h-4" />
                    <div>
                      {owner} / {name ?? '...'}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <GitBranch className="w-4 h-4" />
                    <div>
                      {repo && repo.defaultBranch ? repo.defaultBranch : '...'}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!repo ? (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertDescription>
                    To link a GitHub repository, you need to install the GitHub
                    integration first. Make sure there aren&apos;t any typos and
                    that you have access to the repository if it&apos;s private.
                  </AlertDescription>
                </Alert>
              ) : (
                <GitHubImportServerForm
                  workspace={workspace}
                  name={repo.name}
                  fullName={repo.fullName}
                  isPrivate={repo.private}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
