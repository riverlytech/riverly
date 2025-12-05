import { createServerFn } from '@tanstack/react-start'
import { getRequest, setResponseStatus } from '@tanstack/react-start/server'
import { BetterAuthError } from 'better-auth'

import { env } from '@riverly/config'
import { Database } from '@riverly/db'
import { Organization, User } from '@riverly/riverly'
import { genId } from '@riverly/utils'

import { auth } from '@/lib/auth'
import { authMiddleware } from '@/lib/auth-middleware'
import { CreateOrgForm, OrgNameForm, OrgSlugForm, CreateAPIKeyForm } from '@/validations'

import z from 'zod'

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
    const resp = await Database.transaction((db) =>
      auth(db, env).api.createOrganization({
        body,
      }),
    )
    return resp
  })

export const updateOrgName = createServerFn({ method: 'POST' })
  .inputValidator(OrgNameForm)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const resp = await Database.transaction((db) =>
      auth(db, env).api.updateOrganization({
        body: {
          data: {
            name: data.name,
          },
          organizationId: data.organizationId,
        },
        headers: getRequest().headers,
      }),
    )
    return resp
  })

export const updateOrgSlug = createServerFn({ method: 'POST' })
  .inputValidator(OrgSlugForm)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const resp = await Database.transaction((db) =>
      auth(db, env).api.updateOrganization({
        body: {
          data: {
            slug: data.slug,
          },
          organizationId: data.organizationId,
        },
        headers: getRequest().headers,
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
    const user = await User.fromID(sessionUser.userId)
    if (!user) {
      setResponseStatus(404)
      throw new Error('Not Found')
    }
    if (user.defaultOrgId) {
      setResponseStatus(200)
      return
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
  .inputValidator((data: { userId: string; limit?: number }) => data)
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

export const orgMembership = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string; userId: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user } }) => {
    if (!user) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const membership = await Organization.orgMembership({
      slug: data.slug,
      userId: data.userId,
    })
    if (!membership) {
      setResponseStatus(404)
      return null
    }
    return membership
  })

export const orgAPIKeys = createServerFn({ method: 'GET' })
  .inputValidator((data: { organizationId: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user } }) => {
    if (!user) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const apiKeys = await Organization.orgAPIKeys(data.organizationId)
    return apiKeys
  })


export const orgCreateAPIKey = createServerFn({ method: 'POST' })
  .inputValidator(CreateAPIKeyForm.extend({ organizationId: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user } }) => {
    if (!user) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const apiKeys = (await Database.transaction((db) =>
      auth(db, env).api.createApiKey({
        headers: getRequest().headers,
        body: {
          name: data.name,
          organizationId: data.organizationId,
          expiresIn: env.APIKEY_EXPIRES_IN,
          prefix: env.APIKEY_PREFIX,
        },
      }),
    ))
    return apiKeys
  })

