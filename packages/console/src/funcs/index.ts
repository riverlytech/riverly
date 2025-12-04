import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { BetterAuthError } from 'better-auth'
import z from 'zod/v4'

import { env } from '@riverly/config'
import type { GitHubImportServer } from '@riverly/db'
import { GitHub, Server, ServerDeployment, User } from '@riverly/riverly'
import type { DeploymentTargetType, ServerVisibility } from '@riverly/ty'

import { authMiddleware } from '@/lib/auth-middleware'
import { GitHubImportForm, NewServerForm, ProfileEditForm } from '@/validations'

type DeploymentTarget = DeploymentTargetType | 'all'

export const deploymentsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      organizationId: string
      limit?: number
      target?: DeploymentTarget
    }) => data,
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user } }) => {
    if (!user) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    return ServerDeployment.deployments({
      organizationId: data.organizationId,
      limit: data.limit ?? 3,
      target: data.target ?? 'all',
    })
  })

export const serverDeploymentsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      organizationId: string
      limit?: number
      serverId: string
      target?: DeploymentTarget
    }) => data,
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user } }) => {
    if (!user) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    return ServerDeployment.serverDeployments({
      organizationId: data.organizationId,
      serverId: data.serverId,
      limit: data.limit ?? 3,
      target: data.target ?? 'all',
    })
  })

export const orgDeployment = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { organizationId: string; deploymentId: string }) => data,
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const res = await ServerDeployment.orgDeployment({
      organizationId: data.organizationId,
      deploymentId: data.deploymentId,
    })
    return res
  })

type Visibility = ServerVisibility | 'both'

export const orgInstalledServersFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      organizationId: string
      limit?: number
      visibility: Visibility
    }) => data,
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user } }) => {
    if (!user) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    return Server.orgInstalledServers({
      organizationId: data.organizationId,
      limit: data.limit ?? 3,
      visibility: data.visibility,
    })
  })

export const githubRepoDetailFn = createServerFn({
  method: 'GET',
})
  .inputValidator(
    (data: { organizationId: string; owner: string; name: string }) => data,
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user } }) => {
    if (!user) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const installation = await GitHub.orgInstallation({
      organizationId: data.organizationId,
      githubAppId: env.GITHUB_APP_ID,
      account: data.owner,
    })
    if (!installation) return null

    return await GitHub.repoDetail({
      githubInstallationId: installation.githubInstallationId,
      owner: data.owner,
      repo: data.name,
    })
  })

export const addNewServerFn = createServerFn({ method: 'POST' })
  .inputValidator(NewServerForm)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const newServer = {
      organizationId: data.organizationId,
      memberId: data.memberId,
      title: data.title,
      description: data.description,
      isClaimed: false,
      visibility: data.visibility,
    }
    const response = await Server.addNew(newServer)
    return {
      serverId: response.id,
    }
  })

export const getServerFromIDFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { organizationId: string; serverId: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const response = await Server.fromID({
      callerOrgId: data.organizationId,
      serverId: data.serverId,
    })
    return response
  })

export const getServerFromIDWithGitFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { organizationId: string; serverId: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const response = await Server.fromIDWithGit({
      organizationId: data.organizationId,
      serverId: data.serverId,
    })
    return response
  })

// export const getServerFromNameFn = createServerFn({ method: 'GET' })
//   .inputValidator((data: { username: string; name: string }) => data)
//   .middleware([authMiddleware])
//   .handler(async ({ data, context: { user: sessionUser } }) => {
//     if (!sessionUser) {
//       setResponseStatus(401)
//       throw new BetterAuthError('Unauthorized')
//     }
//     const response = await Server.fromName({
//       callerUserId: sessionUser.userId,
//       username: data.username,
//       name: data.name,
//     })
//     return response
//   })

// export const getServerDetailFromNameFn = createServerFn({ method: 'GET' })
//   .inputValidator((data: { username: string; name: string }) => data)
//   .middleware([authMiddleware])
//   .handler(async ({ data, context: { user: sessionUser } }) => {
//     if (!sessionUser) {
//       setResponseStatus(401)
//       throw new BetterAuthError('Unauthorized')
//     }
//     const response = await Server.detailFromName({
//       callerUserId: sessionUser.userId,
//       username: data.username,
//       name: data.name,
//     })
//     return response
//   })

export const getServerConfigFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { serverId: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const response = await Server.config(data.serverId)
    return response
  })

export const updateProfileNameFn = createServerFn({ method: 'POST' })
  .inputValidator(ProfileEditForm)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    await User.update({
      id: sessionUser.userId,
      name: data.name,
    })
  })

export const orgGitHubInstallationsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { organizationId: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const response = await GitHub.orgInstalls({
      organizationId: data.organizationId,
      githubAppId: env.GITHUB_APP_ID,
    })
    return response
  })

export const importServerFromGitHub = createServerFn({ method: 'POST' })
  .inputValidator(GitHubImportForm.extend({ repoUrl: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ data, context: { user: sessionUser } }) => {
    if (!sessionUser) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const request: z.infer<typeof GitHubImportServer> = {
      title: data.title,
      description: data.description,
      visibility: data.visibility,
      organizationId: data.organizationId,
      memberId: data.memberId,
      repoUrl: data.repoUrl,
    }
    const response = await Server.importFromGitHub({
      ...request,
      githubAppId: env.GITHUB_APP_ID,
    })
    return {
      serverId: response.id,
    }
  })
