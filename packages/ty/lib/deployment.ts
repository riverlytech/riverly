import z from "zod/v4";
import { EnvsSchema, ServerConfigSchema } from "./server";
import { MemberRole } from "./user";

/**
 * Enumeration of possible deployment statuses throughout the deployment lifecycle.
 * Represents the various states a deployment can be in from initialization to completion or failure.
 */
export const DeploymentStatusEnum = {
  PENDING: "pending",
  PLACED: "placed",
  RUNNING: "running",
  READY: "ready",
  ERROR: "error",
  ABORTED: "aborted",
} as const;
export const DeploymentStatus = z.enum(Object.values(DeploymentStatusEnum));
export type DeploymentStatusType = z.infer<typeof DeploymentStatus>;

/**
 * Defines the available deployment target environments for the server.
 */
export const DeploymentTarget = {
  PRODUCTION: "production",
  PREVIEW: "preview",
  DEVELOPMENT: "development",
} as const;
export const deploymentTargetSchema = z.enum(Object.values(DeploymentTarget));
export type DeploymentTargetType = z.infer<typeof deploymentTargetSchema>;

/**
 * Defines type of trigger that initiates the build and deployment
 */
export const TriggerTypeValue = {
  MANUAL: "manual",
  GIT: "git",
} as const;
export const triggerTypeSchema = z.enum(Object.values(TriggerTypeValue));
export type TriggerType = z.infer<typeof triggerTypeSchema>;

export const RevisionStatusValue = {
  DRAFT: "draft",
  PUBLISHED: "published",
  DEPRECATED: "deprecated",
};
export const RevisionStatusSchema = z.enum(Object.values(RevisionStatusValue));
export type RevisionStatus = z.infer<typeof RevisionStatusSchema>;

export const BaseDeployRequest = z.object({
  org: z.object({
    organizationId: z.string(),
    name: z.string(),
  }),
  user: z
    .object({
      role: MemberRole,
      userId: z.string(),
      username: z.string(),
    })
    .required(),
  server: z
    .object({
      serverId: z.string(),
      title: z.string(),
    })
    .required(),
  serverConfig: z
    .object({
      envs: EnvsSchema.optional(),
      inputs: ServerConfigSchema.optional(),
      configRevision: z.string(),
      configHash: z.string(),
      rootDir: z.string().default("./"),
    })
    .required(),
  target: deploymentTargetSchema.default(DeploymentTarget.PREVIEW),
  triggerType: triggerTypeSchema,
});

export const DeployWithGitHubRequest = BaseDeployRequest.extend({
  githubRepo: z.string(),
  githubOwner: z.string(),
  githubRef: z.string(),
  commitHash: z.string(),
  githubAppId: z.number(),
  githubInstallationId: z.number(),
});

export const DeployWithArtifactRequest = BaseDeployRequest.extend({
  artifact: z.string(),
});
