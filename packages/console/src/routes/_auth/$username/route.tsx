import { createFileRoute } from '@tanstack/react-router'

import { NotFound } from '@/components/commons/notfound'

export const Route = createFileRoute('/_auth/$username')({
  beforeLoad: ({ context, params }) => {
    console.log(context, params)
    const workspace = null
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
