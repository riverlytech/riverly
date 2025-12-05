import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import axios, { type AxiosError } from 'axios'
import { BetterAuthError } from 'better-auth'

import { env } from '@riverly/config'

import { authMiddleware, jwtToken } from '@/lib/auth-middleware'
import { GitHubDeployForm } from '@/validations'

export const githubDeployServerFn = createServerFn({ method: 'POST' })
  .inputValidator(GitHubDeployForm)
  .middleware([authMiddleware, jwtToken])
  .handler(async ({ data, context: { user, token } }) => {
    if (!user) {
      setResponseStatus(401)
      throw new BetterAuthError('Unauthorized')
    }
    const payload = {
      serverId: data.serverId,
      repo: data.repo,
      target: data.target,
      config: {
        envs: data.envs,
        rootDir: data.rootDir,
      },
    }
    try {
      const resp = await axios.post<{
        deploymentId: string
        buildId: string
        revisionId: string
      }>(`${env.API_BASEURL}/v1/deployment`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setResponseStatus(200)
      return {
        success: true,
        result: resp.data,
        errors: [],
        messages: [],
      }
    } catch (err: unknown) {
      const error = err as AxiosError
      console.error('GitHub Deployment Error:', error.message)
      setResponseStatus(500)
      return {
        succcess: false,
        result: null,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            details: null,
          },
        ],
        messages: [],
      }
    }
  })
