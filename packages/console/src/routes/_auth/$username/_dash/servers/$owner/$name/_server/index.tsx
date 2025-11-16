import { Link, createFileRoute } from '@tanstack/react-router'
import { Globe, Rocket, Scale } from 'lucide-react'
import { ServerVisibilityEnum } from '@riverly/ty'
import { CopyableCodeBlock } from '@/components/commons/copyable-code-block'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { ExplorePlatform } from '@/components/dash/explore-platform'
// import { getServerConfigFn } from '@/funcs'
import { ConnectOrDeployNew } from '@/components/server/connect-or-deploy'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  GitHubIcon,
  TSIcon,
  PythonIcon,
  JSONIcon,
} from '@/components/icons/icons'

export const Route = createFileRoute(
  '/_auth/$username/_dash/servers/$owner/$name/_server/',
)({
  // loader: async ({ context: { server } }) => {
  //   const serverConfig = await getServerConfigFn({
  //     data: { serverId: server.serverId },
  //   })

  //   return {
  //     server,
  //     serverConfig,
  //   }
  // },
  component: RouteComponent,
})

function RouteComponent() {
  const { server } = Route.useRouteContext()
  const { username, owner, name } = Route.useParams()
  console.log(username, owner, name)
  const serverAvatarUrl =
    server.avatarUrl || `https://avatar.vercel.sh/${server.name}`

  const githubUrl = () => {
    if (server.githubOwner && server.githubRepo) {
      return `https://github.com/${server.githubOwner}/${server.githubRepo}`
    }
    return null
  }
  const gitUrl = githubUrl()

  const visibilityLabels: Record<string, string> = {
    [ServerVisibilityEnum.PUBLIC]: 'Public',
    [ServerVisibilityEnum.PRIVATE]: 'Private',
  }
  const formattedVisibility =
    visibilityLabels[server.visibility] || server.visibility

  const typeScriptSnippet = `
  import {
    StreamableHTTPClientTransport 
  } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
  
  const url = new URL("https://mcp.rivly.app/${owner}/${name}")
  const serverUrl = url.toString()

  const transport = new StreamableHTTPClientTransport(serverUrl)

  // Create MCP client
  import { Client } from "@modelcontextprotocol/sdk/client/index.js"

  const client = new Client({
    name: "My App",
    version: "1.0.0"
  })
  await client.connect(transport)

  // List available tools
  const tools = await client.listTools()
  console.log(\`Available tools: \${tools.map(t => t.name).join(", ")}\`)
  `

  const pythonSnippet = `
  from mcp import ClientSession
  from mcp.client.streamable_http import streamablehttp_client

  # Construct server URL with authentication
  from urllib.parse import urlencode

  base_url = "https://mcp.rivly.app/${owner}/${name}/mcp"
  params = {
      "api_key": "1fc772f7-63b4-4051-83d3-bb1e36b57ced",
      "profile": "complicated-clownfish-8PSEnY",
  }
  url = f"{base_url}?{urlencode(params)}"


  async def main():
      # Connect to the server using HTTP client
      async with streamablehttp_client(url) as (read, write, _):
          async with ClientSession(read, write) as session:
              # Initialize the connection
              await session.initialize()

              # List available tools
              tools_result = await session.list_tools()
              print(f"Available tools: {', '.join([t.name for t in tools_result.tools])}")


  if __name__ == "__main__":
      import asyncio

      asyncio.run(main())
  `
  const jsonSnippet = `
  {
    "mcpServers": {
      "remote-example": {
        "command": "npx",
        "args": [
          "mcp-remote",
          "https://mcp.rivly.app/${owner}/${name}/mcp"
        ]
      }
    }
  }
  `

  return (
    <div className="py-8 px-2 sm:px-4">
      <div className="flex flex-col max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
          {/* column 1, and 2 - full width on mobile, 2/3 on larger screens */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={serverAvatarUrl} alt={server.name} />
                <AvatarFallback className="text-xl">
                  {server.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-3xl">
                <Link
                  to="/users/$username"
                  params={{ username: server.username }}
                  className="text-muted-foreground underline decoration-1 hover:decoration-2 underline-offset-4"
                >
                  {server.username}
                </Link>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="text-primary">{server.name}</span>
              </div>
            </div>

            <p className="py-2 text-wrap max-w-2xl line-clamp-3">
              {server.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm font-thin font-mono">
              <div className="flex items-center gap-1.5 capitalize">
                <Globe className="w-4 h-4" />
                {formattedVisibility}
              </div>
              <div className="flex items-center gap-1.5">
                <Rocket className="w-4 h-4" />
                <span className="font-mono">{server.usageCount}</span>Runs
              </div>
            </div>
          </div>

          {/* column 3 - full width on mobile, 1/3 on larger screens */}
          <div className="col-span-1">
            <div className="flex flex-col space-y-2 sm:pt-4">
              <ConnectOrDeployNew
                username={username}
                owner={owner}
                name={name}
              />
              <div className="flex flex-wrap gap-2">
                {server.visibility === ServerVisibilityEnum.PUBLIC &&
                  server.license && (
                    <div className="flex-1 min-w-0 px-4 py-1 border-b text-sm gap-3 flex items-center h-9 has-[>svg]:px-3 justify-center">
                      <Scale className="w-4 h-4" />
                      <span>{server.license.name || 'Unlicense'}</span>
                    </div>
                  )}
                {gitUrl && (
                  <Button asChild variant="outline" className="flex-1 min-w-0">
                    <a href={gitUrl} target="_blank">
                      <GitHubIcon className="w-4 h-4 mr-2" />
                      <span>GitHub</span>
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col gap-8 w-full lg:w-2/3">
            <div className="relative">
              <Tabs defaultValue="typescript" className={`relative w-full`}>
                <TabsList className="grid h-auto w-full grid-cols-3 gap-3 bg-transparent p-0 mb-6">
                  <TabsTrigger
                    value="typescript"
                    className="flex flex-col items-start justify-between h-24 bg-transparent border rounded-[13px] hover:cursor-pointer hover:bg-neutral-50/50 transition-all duration-100 data-[state=active]:border-orange-400 data-[state=active]:ring-2 data-[state=active]:ring-orange-200 data-[state=active]:bg-transparent p-3 ring-offset-0"
                  >
                    <TSIcon />
                    <p className="text-sm font-medium select-none z-1">
                      TypeScript
                    </p>
                  </TabsTrigger>
                  <TabsTrigger
                    value="python"
                    className="flex flex-col items-start justify-between h-24 bg-transparent border rounded-[13px] hover:cursor-pointer hover:bg-neutral-50/50 transition-all duration-100 data-[state=active]:border-orange-400 data-[state=active]:ring-2 data-[state=active]:ring-orange-200 data-[state=active]:bg-transparent p-3 ring-offset-0"
                  >
                    <PythonIcon />
                    <p className="text-sm font-medium select-none z-1">
                      Python
                    </p>
                  </TabsTrigger>
                  <TabsTrigger
                    value="json"
                    className="flex flex-col items-start justify-between h-24 bg-transparent border rounded-[13px] hover:cursor-pointer hover:bg-neutral-50/50 transition-all duration-100 data-[state=active]:border-orange-400 data-[state=active]:ring-2 data-[state=active]:ring-orange-200 data-[state=active]:bg-transparent p-3 ring-offset-0"
                  >
                    <JSONIcon />
                    <p className="text-sm font-medium select-none z-1">JSON</p>
                  </TabsTrigger>
                </TabsList>
                <div className="rounded-2xl overflow-hidden">
                  <div className="relative">
                    <TabsContent
                      value="typescript"
                      className="space-y-6 min-h-[600px]"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold mb-3">
                            Installation
                          </h3>
                          <CopyableCodeBlock code="npm install @modelcontextprotocol/sdk" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold mb-3">Usage</h3>
                          <CopyableCodeBlock
                            language="typescript"
                            code={typeScriptSnippet}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="python"
                      className="space-y-6 min-h-[600px]"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold mb-3">
                            Installation
                          </h3>
                          <CopyableCodeBlock code='pip install "mcp[cli]"' />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold mb-3">Usage</h3>
                          <CopyableCodeBlock
                            language="python"
                            code={pythonSnippet}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="json"
                      className="space-y-6 min-h-[600px]"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold mb-3">
                            Configuration
                          </h3>
                          <CopyableCodeBlock
                            language="json"
                            code={jsonSnippet}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
              {/* {!isReady ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-background/40 via-background/70 to-background">
                  <Button
                    asChild
                    className="rounded-2xl px-14 py-7 text-lg font-semibold font-mono tracking-tight"
                  >
                    <Link
                      to="/$username/servers/$owner/$name/deploy"
                      params={{ username, owner, name }}
                    >
                      Deploy
                    </Link>
                  </Button>
                </div>
              ) : null} */}
            </div>
          </div>
          <div className="w-full lg:w-1/3">
            {/* <ExplorePlatform className="lg:sticky lg:top-24" /> */}
          </div>
        </div>
        {/* {session && server && <ServerViewedTrack serverId={server.serverId} />} */}
      </div>
    </div>
  )
}
