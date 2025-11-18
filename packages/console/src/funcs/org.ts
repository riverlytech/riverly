import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { BetterAuthError } from 'better-auth'

import { authMiddleware } from '@/lib/auth-middleware'

import { env } from '@riverly/config'
import { auth } from "@/lib/auth"

import { Database } from '@riverly/db'

import { CreateOrgForm } from '@/validations'


export const createNewOrg = createServerFn({ method: 'POST' })
  .inputValidator(CreateOrgForm)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const body = {
      name: data.name,
      slug: data.slug,
      userId: sessionUser.userId, // server-only
      keepCurrentActiveOrganization: false,
    }
    const resp = await Database.use((db) =>
      auth(db, env).api.createOrganization({
        body,
      }),
    )
    return resp
  })



