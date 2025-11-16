import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/lib/auth-middleware'
import { setResponseStatus } from '@tanstack/react-start/server'
import { BetterAuthError } from 'better-auth'
import { Workspace } from '@riverly/riverly'

export const membershipServerFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user } }) => {
    if (!user) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const workspace = await Workspace.withMembership({
      slug: data.slug,
      sessionUser: user,
    })
    return workspace
  })
