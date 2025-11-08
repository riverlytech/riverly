import { GitBranch, ChevronDown } from 'lucide-react'
import { GitHubIcon } from '@/components/icons/icons'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'
import { ServerNotFound } from '@/components/commons/notfound'
import { getServerDetailFromNameFn } from '@/funcs'

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
  component: RouteComponent,
})

function RouteComponent() {
  const { workspace, server } = Route.useRouteContext()
  const name = `${server.owner.username}/${server.name}`
  console.log(name)
  const repo = `${server.githubOwner}/${server.githubRepo}`
  return (
    <div className="p-4 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">New Deployment</CardTitle>
            <CardDescription className="text-base">
              Configure your server deployment settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1 rounded-lg border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Importing from GitHub
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 font-medium">
                  <GitHubIcon className="size-4" />
                  {repo}
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
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                    SR
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-sm font-medium">
                    {workspace.username}
                  </span>
                  <span className="text-sm text-muted-foreground">/</span>
                  <span className="text-sm font-medium text-primary">
                    {server.name}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Root Directory
                </Label>
                <div className="flex flex-col gap-3 rounded-lg border px-4 py-3 md:flex-row md:items-center">
                  <div className="flex flex-1 items-center text-sm">./</div>
                </div>
              </div>

              <div className="space-y-2">
                <SectionButton title="Environment Variables" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button
              size="lg"
              className="w-full text-base font-semibold font-mono"
            >
              Deploy
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function SectionButton({ title }: { title: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="flex h-auto w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium"
    >
      {title}
      <ChevronDown className="size-4 text-muted-foreground" />
    </Button>
  )
}
