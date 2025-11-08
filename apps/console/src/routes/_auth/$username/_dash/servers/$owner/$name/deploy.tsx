import { GitBranch, ChevronDown } from 'lucide-react'
import { GitHubIcon } from '@/components/icons/icons'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/$username/_dash/servers/$owner/$name/deploy',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-4 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">New Deployment</CardTitle>
            <CardDescription>
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
                  sanchitrk/obot-main
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <GitBranch className="size-4" />
                  main
                </span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium">Sanchit Rk</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="secondary"
                        className="rounded-full px-2 py-0"
                      >
                        Hobby
                      </Badge>
                      <span>Plan</span>
                    </div>
                  </div>
                  <Select defaultValue="hobby">
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="hobby">Hobby</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Project Name
                </Label>
                <Input defaultValue="obot-main" />
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
                  <Button variant="outline" size="sm" className="min-w-20">
                    Edit
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <SectionButton title="Build and Output Settings" />
                <SectionButton title="Environment Variables" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button className="h-11 w-full bg-black text-base text-white hover:bg-black/90">
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
