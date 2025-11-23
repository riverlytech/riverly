import { createFileRoute } from '@tanstack/react-router'

import { processMarkdown } from '@/components/utils/markdown'

import { serverReadmeFn } from '@/funcs/server'

export const Route = createFileRoute(
  '/_auth/$slug/_dash/servers/$serverId/_detail/readme',
)({
  loader: async ({ params, context: { membership } }) => {
    const markdown = await serverReadmeFn({ data: { serverId: params.serverId, organizationId: membership.org.id } })
    const html = await processMarkdown(markdown)
    return { html }
  },
  errorComponent: ({ error }) => {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-muted-foreground py-24">
            <p className="text-base">
              {error.message || 'Something went wrong!'}
            </p>
          </div>
        </div>
      </div>
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { html } = Route.useLoaderData()
  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <article className="prose p-4 max-w-4xl border rounded-sm">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>
    </div>
  )
}
