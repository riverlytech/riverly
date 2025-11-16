import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDownIcon, CopyIcon, CheckIcon, PlusIcon } from 'lucide-react'
import { useCopyToClipboard } from '@uidotdev/usehooks'

// Mock data for revisions
const mockRevisions = [
  {
    type: 'current' as const,
    version: '1.2.3',
    url: 'https://api.example.com/v1/current',
  },
  {
    type: 'version' as const,
    version: '1.2.2',
    url: 'https://api.example.com/v1/1.2.2',
  },
  {
    type: 'version' as const,
    version: '1.2.1',
    url: 'https://api.example.com/v1/1.2.1',
  },
  {
    type: 'version' as const,
    version: '1.2.0',
    url: 'https://api.example.com/v1/1.2.0',
  },
  {
    type: 'version' as const,
    version: '1.1.9',
    url: 'https://api.example.com/v1/1.1.9',
  },
  {
    type: 'version' as const,
    version: '1.1.8',
    url: 'https://api.example.com/v1/1.1.8',
  },
  {
    type: 'version' as const,
    version: '1.1.7',
    url: 'https://api.example.com/v1/1.1.7',
  },

  {
    type: 'version' as const,
    version: '1.1.6',
    url: 'https://api.example.com/v1/1.1.6',
  },
]

type Revision =
  | (typeof mockRevisions)[number]
  | { type: 'new'; version: ''; url: '' }

export function ConnectOrDeployNew({
  username,
  owner,
  name,
}: {
  username: string
  owner: string
  name: string
}) {
  const [selectedRevision, setSelectedRevision] = useState<Revision>(
    mockRevisions[0]!,
  )
  const [, copyToClipboard] = useCopyToClipboard()
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const handleCopy = async (url: string, version: string) => {
    try {
      await copyToClipboard(url)
      setCopiedStates((prev) => ({ ...prev, [version]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [version]: false }))
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const renderCopyButton = () => {
    if (selectedRevision.type === 'new') {
      return (
        <Button
          asChild
          className="justify-between flex-1 min-w-0 font-mono font-semibold"
        >
          <Link
            to="/$username/servers/$owner/$name/deploy"
            params={{ username, owner, name }}
          >
            <div className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              <span>Deploy</span>
            </div>
          </Link>
        </Button>
      )
    }

    return (
      <Button
        className="justify-between flex-1 min-w-0 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        onClick={() =>
          handleCopy(selectedRevision.url, selectedRevision.version)
        }
      >
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <span className="text-xs shrink-0">
            {selectedRevision.type === 'current' ? 'Current' : 'Revision'}@
            {selectedRevision.version}
          </span>
          <div className="ml-1 max-w-[200px] overflow-hidden">
            <span className="text-xs whitespace-nowrap bg-linear-to-r from-white/95 via-white/80 to-white/30 bg-clip-text text-transparent">
              {selectedRevision.url}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {copiedStates[selectedRevision.version] ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
        </div>
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Copy Button - Left side, longer */}
      {renderCopyButton()}

      {/* Dropdown Selector - Right side, compact icon button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]" align="end">
          <DropdownMenuLabel>Select Revision</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <ScrollArea className="h-[200px]">
            <div className="p-1">
              {/* New revision option */}
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() =>
                  setSelectedRevision({ type: 'new', version: '', url: '' })
                }
              >
                <div className="flex items-center gap-1 w-full">
                  <PlusIcon className="h-4 w-4" />
                  <span className="text-sm font-mono">Create Deployment</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Current and version revisions */}
              {mockRevisions.map((revision) => (
                <DropdownMenuItem
                  key={`${revision.type}-${revision.version}`}
                  className="cursor-pointer"
                  onSelect={() => setSelectedRevision(revision)}
                >
                  <div className="flex items-center gap-4 w-full">
                    <span className="text-xs font-mono">
                      {revision.type === 'current' ? 'Current' : ''}@
                      {revision.version}
                    </span>
                    <div className="ml-auto w-full overflow-hidden">
                      <span className="text-xs whitespace-nowrap bg-linear-to-r from-muted-foreground to-transparent bg-clip-text text-transparent">
                        {revision.url}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
