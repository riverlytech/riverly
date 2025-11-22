import { Link } from '@tanstack/react-router'
import { CheckCircle, Globe2, Lock, Rocket, ShieldCheck } from 'lucide-react'

import type { Server } from '@riverly/riverly'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function UserServerCard({
  slug,
  server,
}: {
  slug: string
  server: Server.Server
}) {
  const image = server.image || `https://avatar.vercel.sh/${server.serverId}`
  return (
    <Link
      to="/$slug/servers/$serverId"
      params={{
        slug,
        serverId: server.serverId,
      }}
      className="group block focus:outline-none"
    >
      <Card className="relative overflow-hidden gap-3 flex-row items-stretch p-3 md:p-4 rounded-md min-h-[96px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors duration-150 shadow-none group-focus:ring-2 group-focus:ring-zinc-400">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-sky-500/10 via-emerald-500/5 to-transparent transition-opacity"
        />
        <div className="relative w-20 h-20 min-w-20 min-h-20 overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 rounded-sm">
          <img
            src={image}
            alt={server.title}
            width={80}
            height={80}
            className="object-cover w-20 h-20"
            draggable={false}
          />
          {server.verified && (
            <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 text-white p-1 shadow-sm">
              <ShieldCheck className="w-3 h-3" />
            </span>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col justify-center gap-2 p-0 min-w-0 h-full">
          <div className="flex items-center gap-2 w-full">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {server.title}
              </span>
              {server.verified && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-600/90 text-white border-emerald-600/80"
                >
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </Badge>
              )}
              <Badge variant="outline" className="text-[11px]">
                {server.visibility === 'private' ? (
                  <>
                    <Lock className="w-3 h-3" />
                    Private
                  </>
                ) : (
                  <>
                    <Globe2 className="w-3 h-3" />
                    Public
                  </>
                )}
              </Badge>
            </div>
            {server.org?.name && (
              <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[40%] text-right">
                {server.org.name}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-snug break-words">
            {server.description || 'No description provided yet.'}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Rocket className="w-3 h-3" />
              {server.usageCount} Runs
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
