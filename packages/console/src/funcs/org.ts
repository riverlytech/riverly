import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { BetterAuthError } from 'better-auth'

import { env } from '@riverly/config'
import { Database } from '@riverly/db'
import { Organization, User, } from '@riverly/riverly'
import { genId } from '@riverly/utils'

import { auth } from '@/lib/auth'
import { authMiddleware } from '@/lib/auth-middleware'
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

export const makeDefaultOrgFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }

    if (sessionUser.defaultOrgId) {
      setResponseStatus(200)
      return
    }

    const user = await User.fromID(sessionUser.userId)
    if (!user) {
      setResponseStatus(404)
      throw new Error('Not Found')
    }
    const values = {
      name: `${user.name}`,
      slug: `${user.username}-${genId(4)}`,
    }
    await Organization.createDefaultOrg({
      org: values,
      userId: user.id,
    })
  })

export const memberOrgsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { userId: string; limit?: number }) => data,
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user } }) => {
    if (!user) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    return await Organization.memberOrgs({
      userId: data.userId,
      limit: data.limit ?? 100,
    })
  })

