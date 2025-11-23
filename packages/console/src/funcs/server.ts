import { createServerFn } from '@tanstack/react-start'
import { getRequest, setResponseStatus } from '@tanstack/react-start/server'
import { BetterAuthError } from 'better-auth'

import { authMiddleware } from '@/lib/auth-middleware'

export const serverReadmeFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { organizationId: string; serverId: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }

    try {
      const url = `/api/servers/${data.serverId}/readme?orgId=${data.organizationId}`
      const response = await fetch(url, {
        headers: getRequest().headers,
      })
      if (!response.ok || response.status < 200 || response.status >= 300) {
        throw new Error(
          `Failed to fetch README: ${response.status} ${response.statusText}`,
        )
      }
      const text = await response.text()
      return text
    } catch (err) {
      console.error(err)
      setResponseStatus(500)
      throw new Error(`Failed to fetch README: ${500} Error`)
    }
  })
