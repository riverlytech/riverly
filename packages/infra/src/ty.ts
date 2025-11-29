import z from "zod/v4";
import { MemberRole, DeploymentStatusEnum } from "@riverly/ty";

//
// Represents the schema for GitHub linked source builder
export const GitHubSourceBuilder = z.object({
  org: z
    .object({
      organizationId: z.string(),
      name: z.string(),
    })
    .required(),
  member: z
    .object({
      memberId: z.string(),
      userId: z.string(),
      role: MemberRole,
      username: z.string(),
    })
    .required(),
  server: z
    .object({
      serverId: z.string(),
      title: z.string(),
    })
    .required(),
  githubRepo: z.string(),
  githubOrg: z.string(),
  githubRef: z.string(),
  commitHash: z.string(),
  githubAppId: z.number(),
  githubInstallationId: z.number(),
  build: z
    .object({
      buildId: z.string(),
      envs: z
        .array(
          z
            .object({
              name: z.string(),
              value: z.string(),
              secret: z.boolean().optional().default(false),
            })
            .required()
        )
        .default([]),
      inputs: z.record(z.string(), z.any()).optional(),
      configRevision: z.string(),
      configHash: z.string(),
      rootDir: z.string().default("./"),
    })
    .required(),
});

export type GitHubSourceBuilder = z.infer<typeof GitHubSourceBuilder>;

//
// Respresents the schema for GitHub linked source build + deployer
export const GitHubSourceDeployer = GitHubSourceBuilder.extend({
  deployment: z
    .object({
      deploymentId: z.string(),
      target: z.string(),
      publicId: z.string(),
    })
    .required(),
});

export type GitHubSourceDeployer = z.infer<typeof GitHubSourceDeployer>;


export const DeploymentEvent = z.object({
  id: z.string().nullable(),
  buildId: z.string(),
  deploymentId: z.string(),
  status: DeploymentStatusEnum,
  metadata: z.record(z.string(), z.any()).optional(),
  message: z.string().optional(),
  resourceIds: z.record(z.string(), z.string()).optional(),
})

export type DeploymentEvent = z.infer<typeof DeploymentEvent>;

