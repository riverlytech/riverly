import z from "zod/v4";

const defaultRegion = () => process.env.RIVERLY_GCP_REGION || "us-central1";
const ghSecretKeyName = () =>
  process.env.RIVERLY_GH_SECRET_KEY_NAME || "riverly-localhost-gh-pem-raw";
const gcpProjectId = () => process.env.RIVERLY_GCP_PROJECT_ID || "a0run-001";

export const gcpConfigSchema = z.object({
  GCP_REGION: z.string().default(defaultRegion()),
  GH_SECRET_KEY: z.string().default(ghSecretKeyName()),
  GCP_PROJECT_ID: z.string().default(gcpProjectId()),
});

export const gcpCloudBuildConfigSchema = z.object({
  maxTimeoutSeconds: z.number().default(1200),
  dockerBuildTimeout: z.string().default("600s"),
});

// We can have setup something like remote gcp config
// which can be fetched with rpc call for dynamically
// loading stored config.
// KV store ?
