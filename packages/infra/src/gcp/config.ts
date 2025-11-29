import z from "zod/v4";

const gcpProjectId = () => process.env.RIVERLY_GCP_PROJECT_ID || "a0run-001";
const defaultRegion = () => process.env.RIVERLY_GCP_REGION || "us-central1";

const ghSecretKeyName = () =>
  process.env.RIVERLY_GH_SECRET_KEY_NAME || "riverly-localhost-gh-pem-raw";
const gcpUseRestCloudBuild = () => process.env.RIVERLY_GCP_USE_REST_CLOUDBUILD || "1";

export const gcpConfigSchema = z.object({
  GCP_REGION: z.string().default(defaultRegion()),
  GH_SECRET_KEY: z.string().default(ghSecretKeyName()),
  GCP_PROJECT_ID: z.string().default(gcpProjectId()),
  GCP_USE_REST_CLOUDBUILD: z.string().default(gcpUseRestCloudBuild()),
});

export type GCPConfig = z.infer<typeof gcpConfigSchema>;

export const gcpCloudBuildConfigSchema = z.object({
  maxTimeoutSeconds: z.number().default(1200),
  dockerBuildTimeout: z.string().default("600s"),
});

export type GCPBuildConfig = z.infer<typeof gcpCloudBuildConfigSchema>;

export function useDefualtGCPConfig() {
  return gcpConfigSchema.parse({});
}
export function useDefualtGCPBuildConfig() {
  return gcpCloudBuildConfigSchema.parse({});
}
