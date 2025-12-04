import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { GitCommitHorizontal, Server as ServerIcon } from 'lucide-react'

import { HashDisplay } from '@/components/commons/display-hash'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { deploymentStatusColors, getVerboseStatusName } from '@/components/utils'

type DeploymentList = Awaited<
  ReturnType<
    (typeof import('@riverly/riverly'))['ServerDeployment']['deployments']
  >
>
type DeploymentListItem = DeploymentList[number]

export function DeploymentPreview({
  deployment,
}: {
  deployment: DeploymentListItem
}) {

  const avatarUrl =
    deployment.avatarUrl || `https://avatar.vercel.sh/${deployment.deploymentId}`
  const buildLabel = deployment.buildId?.slice(0, 8) ?? 'unknown'
  const createdAt =
    deployment.createdAt instanceof Date
      ? deployment.createdAt
      : new Date(deployment.createdAt)

  return (
    <Link
      to="/$slug/deployments/$deploymentId"
      params={{ slug: "sanchitrk", deploymentId: deployment.deploymentId }}
      className="group block focus:outline-none"
    >
      <Card className="p-0 rounded-md flex bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150 shadow-none group-focus:ring-2 group-focus:ring-zinc-400">
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 md:p-4 w-full">
          <div className="flex items-center gap-3 md:col-span-2">
            <div className="w-16 h-16 min-w-16 min-h-16 overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 rounded-sm">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={deployment.title}
                  width={64}
                  height={64}
                  className="object-cover w-16 h-16"
                  draggable={false}
                />
              ) : (
                <ServerIcon className="w-6 h-6 text-zinc-500" />
              )}
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {deployment.title}
                </span>
                <Badge variant="outline" className="text-[11px]">
                  Build {buildLabel}
                </Badge>
              </div>
              <div
                className={`flex items-center gap-2 text-xs ${deploymentStatusColors[deployment.status]}`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                {getVerboseStatusName(deployment.status)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:justify-center md:col-span-1">
            <GitCommitHorizontal className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <div className="flex flex-col">
              <HashDisplay
                hash={deployment.imageDigest ?? 'unknown'}
                className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-none"
              />
            </div>
          </div>

          <div className="flex items-center md:justify-end md:col-span-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
