import { useMemo, useState } from 'react'

import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCopyToClipboard } from '@uidotdev/usehooks'
import { format, formatDistanceToNow } from 'date-fns'
import { CheckIcon, CopyIcon, InfoIcon, PlusIcon } from 'lucide-react'

import { APIKeyForm } from '@/components/settings/create-apikey-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { orgAPIKeys } from '@/funcs/org'


function maskApiKeyStart(keyStart: string | null) {
  if (!keyStart) return '—'
  if (keyStart.length <= 11) return keyStart
  return `${keyStart.slice(0, 7)}...${keyStart.slice(-4)}`
}

function formatRelativeTime(value: Date | string | null | undefined) {
  if (!value) return 'Not used yet'
  const date = value instanceof Date ? value : new Date(value)
  return formatDistanceToNow(date, { addSuffix: true })
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  return format(date, 'PP p')
}

export const Route = createFileRoute('/_auth/$slug/_dash/settings/apikeys')({
  loader: async ({ context: { membership } }) => {
    const apiKeys = await orgAPIKeys({ data: { organizationId: membership.org.id } })
    return { apiKeys }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { membership } = Route.useRouteContext()
  const { apiKeys } = Route.useLoaderData()
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const router = useRouter()
  const [, copyToClipboard] = useCopyToClipboard()
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const selectedKey = useMemo(
    () => apiKeys.find((key) => key.id === selectedKeyId) ?? null,
    [apiKeys, selectedKeyId],
  )

  async function handleKeyCreated() {
    await router.invalidate({
      filter: (match) => match.fullPath?.endsWith('/settings/apikeys'),
    })
    setCreateDialogOpen(false)
  }

  return (
    <div className="flex flex-col space-y-4 w-full md:w-3/4">
      <Card className="shadow-none">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys. Keys stay visible here, so copy or rotate anytime.
            </CardDescription>
          </div>
          <Button
            className="w-full sm:w-auto gap-2"
            onClick={() => setCreateDialogOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Create API Key
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hidden md:grid grid-cols-[1.8fr_1.6fr_1.2fr_0.8fr] text-xs uppercase text-muted-foreground tracking-wide">
            <span>Name</span>
            <span>Key</span>
            <span>Created By</span>
            <span className="sr-only">Actions</span>
          </div>
          <div className="divide-y divide-border rounded-lg border md:rounded-none md:border-0">
            {apiKeys.map((apiKey) => {
              const rawKey = apiKey.key ?? apiKey.start ?? null
              const lastUsedLabel = apiKey.lastRequest
                ? formatRelativeTime(apiKey.lastRequest)
                : 'Not used yet'
              return (
                <div
                  key={apiKey.id}
                  className="grid grid-cols-1 gap-3 p-4 md:p-0 md:grid-cols-[1.8fr_1.6fr_1.2fr_0.8fr] md:items-center md:py-3"
                >
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground md:hidden">
                      Name
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{apiKey.name ?? 'Untitled key'}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${apiKey.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {apiKey.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground md:hidden">
                      Key
                    </p>
                    <div className="flex flex-col gap-1">
                      <p className="font-mono text-sm break-all md:truncate">
                        {maskApiKeyStart(rawKey)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {apiKey.lastRequest
                          ? `Last used ${lastUsedLabel}`
                          : 'Not used yet'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground md:hidden">
                      Created By
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {apiKey.user?.name ?? '—'}
                    </p>
                  </div>
                  <div className="flex gap-2 md:justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (!rawKey) return
                        await copyToClipboard(rawKey)
                        setCopiedStates((prev) => ({ ...prev, [apiKey.id]: true }))
                        setTimeout(
                          () =>
                            setCopiedStates((prev) => ({
                              ...prev,
                              [apiKey.id]: false,
                            })),
                          1500,
                        )
                      }}
                      disabled={!rawKey}
                      aria-label={copiedStates[apiKey.id] ? 'Copied' : 'Copy API key'}
                    >
                      {copiedStates[apiKey.id] ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full md:w-auto"
                      onClick={() => {
                        setSelectedKeyId(apiKey.id)
                        setDialogOpen(true)
                      }}
                    >
                      More
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New API Key</DialogTitle>
            <DialogDescription>
              Choose a unique name that helps you identify this key.
            </DialogDescription>
          </DialogHeader>
          <APIKeyForm
            organizationId={membership.org.id}
            onSuccess={handleKeyCreated}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Details</DialogTitle>
            <DialogDescription>
              Safe details only. Use rotation for any keys you no longer trust.
            </DialogDescription>
          </DialogHeader>
          {selectedKey ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow label="Name" value={selectedKey.name ?? 'Untitled key'} />
                <InfoRow label="Prefix" value={selectedKey.prefix ?? '—'} />
                <InfoRow
                  label="Key Start"
                  value={maskApiKeyStart(selectedKey.start)}
                />
                <InfoRow
                  label="Status"
                  value={selectedKey.enabled ? 'Enabled' : 'Disabled'}
                />
                <InfoRow
                  label="Created By"
                  value={selectedKey.user?.name ?? '—'}
                />
                <InfoRow
                  label="Created At"
                  value={formatDateTime(selectedKey.createdAt.toDateString())}
                />
                <InfoRow
                  label="Last Used"
                  value={formatRelativeTime(selectedKey.lastRequest?.toDateString())}
                />
              </div>
              <div className="flex items-start gap-2 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                <InfoIcon className="h-4 w-4 shrink-0" />
                <p>
                  Keys remain visible here. Rotate and delete any key you no longer
                  need.
                </p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                className="w-full justify-center gap-2"
                onClick={async () => {
                  if (!selectedKey) return
                  const toCopy = selectedKey.key ?? selectedKey.start ?? ''
                  if (!toCopy) return
                  await copyToClipboard(toCopy)
                  setCopiedStates((prev) => ({ ...prev, dialog: true }))
                  setTimeout(
                    () => setCopiedStates((prev) => ({ ...prev, dialog: false })),
                    1500,
                  )
                }}
                disabled={!selectedKey || (!selectedKey.key && !selectedKey.start)}
                aria-label={copiedStates.dialog ? 'Copied' : 'Copy API key'}
              >
                {copiedStates.dialog ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {copiedStates.dialog ? 'Copied' : 'Copy Key'}
                </span>
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Key
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}
