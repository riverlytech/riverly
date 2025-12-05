import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const mockApiKeys = [
  {
    id: '1',
    name: 'Production Deployments',
    key: 'rv_live_92JN-13n2o82b2k3v9sF7x',
    createdBy: 'Alex Kim',
    lastUsed: '2 hours ago',
  },
  {
    id: '2',
    name: 'CI / CD Pipeline',
    key: 'rv_test_81nxn3Mns7810mb12f1',
    createdBy: 'Priya Shah',
    lastUsed: 'Yesterday',
  },
  {
    id: '3',
    name: 'Local Development',
    key: 'rv_dev_12b3c4d5e6f7g8h9i0j',
    createdBy: 'Taylor Brooks',
    lastUsed: 'Mar 10, 2024',
  },
]

function maskApiKey(key: string) {
  if (key.length <= 11) return key
  return `${key.slice(0, 7)}...${key.slice(-4)}`
}

export const Route = createFileRoute('/_auth/$slug/_dash/settings/apikeys')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col space-y-4 w-full md:w-3/4">
      <Card className="shadow-none">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys for accessing your Riverly services.
            </CardDescription>
          </div>
          <Button className="w-full sm:w-auto gap-2">
            <PlusIcon className="h-4 w-4" />
            Create API Key
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hidden md:grid grid-cols-[1.6fr_1.4fr_1fr_0.9fr_0.5fr] text-xs uppercase text-muted-foreground tracking-wide">
            <span>Name</span>
            <span>Key</span>
            <span>Created By</span>
            <span>Last Used</span>
            <span className="sr-only">Actions</span>
          </div>
          <div className="divide-y divide-border rounded-lg border md:rounded-none md:border-0">
            {mockApiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="grid grid-cols-1 gap-3 p-4 md:p-0 md:grid-cols-[1.6fr_1.4fr_1fr_0.9fr_0.5fr] md:items-center md:py-3"
              >
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground md:hidden">
                    Name
                  </p>
                  <p className="text-sm">{apiKey.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground md:hidden">
                    Key
                  </p>
                  <p className="font-mono text-sm break-all md:truncate">
                    {maskApiKey(apiKey.key)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground md:hidden">
                    Created By
                  </p>
                  <p className="text-sm text-muted-foreground">{apiKey.createdBy}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground md:hidden">
                    Last Used
                  </p>
                  <p className="text-sm text-muted-foreground">{apiKey.lastUsed}</p>
                </div>
                <div className="flex md:justify-end">
                  <Button variant="ghost" size="icon" aria-label="Delete API key">
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
