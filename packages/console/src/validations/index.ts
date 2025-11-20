import z from 'zod/v4'

import { ServerVisibilityEnum, DeploymentTarget, EnvsSchema } from '@riverly/ty'

export const NewServerForm = z.object({
  organizationId: z.string(),
  memberId: z.string(),
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters.' })
    .max(32, { message: 'Title must not be longer than 32 characters.' }),
  description: z.string().max(220, {
    message: 'Description must not be longer than 200 characters.',
  }),
  visibility: z.enum([
    ServerVisibilityEnum.PUBLIC,
    ServerVisibilityEnum.PRIVATE,
  ]),
})

export const GitHubImportForm = z.object({
  organizationId: z.string(),
  memberId: z.string(),
  repoUrl: z.string(),
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters.' })
    .max(32, { message: 'Title must not be longer than 32 characters.' }),
  description: z.string().max(220, {
    message: 'Description must not be longer than 200 characters.',
  }),
  visibility: z.enum([
    ServerVisibilityEnum.PUBLIC,
    ServerVisibilityEnum.PRIVATE,
  ]),
})

export const ProfileEditForm = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(32, { message: 'Name must not be longer than 32 characters.' }),
})

export const GitHubDeployForm = z.object({
  serverId: z.string(),
  repo: z.string(),
  rootDir: z.string().min(1, 'Root directory is required'),
  envs: EnvsSchema,
  target: z.enum([DeploymentTarget.PREVIEW, DeploymentTarget.PRODUCTION]),
})

export const CreateOrgForm = z.object({
  name: z.string().min(1, { message: 'Name must be at least 1 characters.' }),
  slug: z
    .string()
    .min(3, { message: 'Slug must be at least 3 characters.' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Use lowercase letters, numbers, and dashes only.',
    }),
})
