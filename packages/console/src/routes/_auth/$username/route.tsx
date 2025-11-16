import { createFileRoute } from '@tanstack/react-router'
import { $getWorkspace } from '@/lib/auth-workspace-fn'
import { NotFound } from '@/components/commons/notfound'

export const Route = createFileRoute('/_auth/$username')({
  beforeLoad: async ({ context, params }) => {
    const workspace = await $getWorkspace(context.queryClient, {
      slug: params.username,
    })
    // There is hydration mismatch on throwing notFound() manually
    // this is a workaround by throwing an error.
    if (!workspace) throw new Error('Not Found')
    return {
      workspace,
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not Found') {
      return <NotFound />
    }
    throw error
  },
})
