import { useMemo, useState } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import { InfoIcon, PlusIcon } from 'lucide-react'

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

type ApiKeyPreview = {
  id: string
  name: string | null
  start: string | null
  prefix: string | null
  userId?: string
  createdBy?: string
  lastRequest?: string | null
  createdAt: string
  enabled: boolean
}

const mockApiKeys: ApiKeyPreview[] = [
  {
    id: '1',
    name: 'Production Deployments',
    start: 'rv_live_92JN-13n2',
    prefix: 'rv_live',
    createdBy: 'Alex Kim',
    lastRequest: '2024-03-20T12:15:00Z',
    createdAt: '2024-02-11T12:00:00Z',
    enabled: true,
  },
  {
    id: '2',
    name: 'CI / CD Pipeline',
    start: 'rv_test_81nxn3M',
    prefix: 'rv_test',
    createdBy: 'Priya Shah',
    lastRequest: '2024-03-19T08:22:00Z',
    createdAt: '2024-01-04T09:30:00Z',
    enabled: true,
  },
  {
    id: '3',
    name: 'Local Development',
    start: 'rv_dev_12b3c4d',
    prefix: 'rv_dev',
    createdBy: 'Taylor Brooks',
    lastRequest: null,
    createdAt: '2023-12-20T18:45:00Z',
    enabled: false,
  },
]

function maskApiKeyStart(keyStart: string | null) {
  if (!keyStart) return '—'
  if (keyStart.length <= 11) return keyStart
  return `${keyStart.slice(0, 7)}...${keyStart.slice(-4)}`
}

export const Route = createFileRoute('/_auth/$slug/_dash/settings/apikeys')({
  loader: async ({ context: { membership } }) => {
    const apiKeys = await orgAPIKeys({ data: { organizationId: membership.org.id } })
    return { apiKeys }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { apiKeys } = Route.useLoaderData()
  const keysToRender = (apiKeys?.length ? apiKeys : mockApiKeys) as ApiKeyPreview[]
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const selectedKey = useMemo(
    () => keysToRender.find((key) => key.id === selectedKeyId) ?? null,
    [keysToRender, selectedKeyId],
  )

  return (
    <div className="flex flex-col space-y-4 w-full md:w-3/4">
      <Card className="shadow-none">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys. Only safe, partial key details are shown here.
            </CardDescription>
          </div>
          <Button className="w-full sm:w-auto gap-2">
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
            {keysToRender.map((apiKey) => (
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
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                        apiKey.enabled
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
                      {maskApiKeyStart(apiKey.start)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {apiKey.lastRequest
                        ? `Last used ${new Date(apiKey.lastRequest).toLocaleString()}`
                        : 'Not used yet'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground md:hidden">
                    Created By
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {apiKey.createdBy ?? apiKey.userId ?? '—'}
                  </p>
                </div>
                <div className="flex gap-2 md:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full md:w-auto"
                    onClick={() => {
                      setSelectedKeyId(apiKey.id)
                      setDialogOpen(true)
                    }}
                  >
                    Expand
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                  value={selectedKey.createdBy ?? selectedKey.userId ?? '—'}
                />
                <InfoRow
                  label="Created At"
                  value={new Date(selectedKey.createdAt).toLocaleString()}
                />
                <InfoRow
                  label="Last Used"
                  value={
                    selectedKey.lastRequest
                      ? new Date(selectedKey.lastRequest).toLocaleString()
                      : 'Not used yet'
                  }
                />
              </div>
              <div className="flex items-start gap-2 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                <InfoIcon className="h-4 w-4 shrink-0" />
                <p>
                  For security, full API keys are never shown. Rotate keys you suspect
                  are compromised.
                </p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="destructive" className="w-full">
              Delete Key
            </Button>
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
