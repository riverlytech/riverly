import { createFileRoute } from '@tanstack/react-router'

import { NotFound } from '@/components/commons/notfound'
import { orgMembership } from '@/funcs/org'

export const Route = createFileRoute('/_auth/$slug')({
  beforeLoad: async ({ context: { sessionUser }, params: { slug } }) => {
    const membership = await orgMembership({
      data: { slug, userId: sessionUser.userId },
    })
    // There is hydration mismatch on throwing notFound() manually
    // this is a workaround by throwing an error.
    if (!membership) throw new Error('Not Found')
    return {
      membership,
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not Found') {
      return <NotFound />
    }
    throw error
  },
})
