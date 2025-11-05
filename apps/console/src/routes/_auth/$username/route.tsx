import { createFileRoute, notFound } from '@tanstack/react-router'
import { $getWorkspace } from '@/lib/auth-workspace-fn'

export const Route = createFileRoute('/_auth/$username')({
  beforeLoad: async ({ context, preload, params }) => {
    if (preload) return
    const workspace = (await $getWorkspace(
      context.queryClient,
      { slug: params.username },
    ))
    if (!workspace) throw notFound()
    return {
      workspace,
    }
  },
})

