import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

const apiConfig = new pulumi.Config("api");

const plainEnvVarNames = ["BETTER_AUTH_URL", "BASEURL", "API_BASEURL"] as const;

const secretEnvVarNames = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_APP_ID",
  "GITHUB_PRIVATE_KEY_BASE64",
  "INTERNAL_WEBHOOK_USERNAME",
  "INTERNAL_WEBHOOK_PASSWORD",
  "ELECTRIC_SYNC_BASEURL",
] as const;

const plainBuildArgNames: readonly string[] = [];
const secretBuildArgNames: readonly string[] = [];
const optionalPlainBuildArgNames: readonly string[] = [];

const region = gcp.config.region ?? apiConfig.get("region") ?? "us-central1";

const envs = [
  ...plainEnvVarNames.map((name) => ({
    name,
    value: apiConfig.require(name),
  })),
  ...secretEnvVarNames.map((name) => ({
    name,
    value: apiConfig.requireSecret(name),
  })),
];

const buildArgs: Record<string, pulumi.Input<string>> = {
  ...Object.fromEntries(
    plainBuildArgNames.map((name) => [name, apiConfig.require(name)]),
  ),
  ...Object.fromEntries(
    secretBuildArgNames.map((name) => [name, apiConfig.requireSecret(name)]),
  ),
  ...(() => {
    const optionalArgs: Record<string, pulumi.Input<string>> = {};
    for (const name of optionalPlainBuildArgNames) {
      const value = apiConfig.get(name);
      if (value !== undefined) {
        optionalArgs[name] = value;
      }
    }
    return optionalArgs;
  })(),
};

// Enable required services
const artifactRegistry = new gcp.projects.Service("artifactregistry", {
  service: "artifactregistry.googleapis.com",
});

const cloudBuild = new gcp.projects.Service("cloudbuild", {
  service: "cloudbuild.googleapis.com",
});

const cloudRun = new gcp.projects.Service("cloudrun", {
  service: "run.googleapis.com",
});

// Create an Artifact Registry repository
const repository = new gcp.artifactregistry.Repository(
  "apirepo",
  {
    location: region,
    repositoryId: "apirepo",
    format: "DOCKER",
  },
  { dependsOn: [artifactRegistry] },
);

// Get the repository URL
const repositoryUrl = pulumi.interpolate`${repository.location}-docker.pkg.dev/${gcp.config.project}/${repository.name}`;

// Build and publish the Docker image
const image = new docker.Image(
  "apiimage",
  {
    imageName: pulumi.interpolate`${repositoryUrl}/api`,
    build: {
      context: "../../",
      dockerfile: "../../apps/api/Dockerfile",
      platform: "linux/amd64",
      args: buildArgs,
    },
  },
  { dependsOn: [cloudBuild] },
);

// Create a dedicated service account for the Cloud Run service
const serviceAccount = new gcp.serviceaccount.Account("api-sa", {
  accountId: "api-sa",
  displayName: "API Service Account",
});

// Give the service account the Cloud Build Editor role
const cloudBuildEditorBinding = new gcp.projects.IAMMember(
  "api-sa-cloudbuild-editor",
  {
    project: gcp.config.project!,
    role: "roles/cloudbuild.builds.editor",
    member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
  },
);

const cloudBuildViewerBinding = new gcp.projects.IAMMember(
  "api-sa-cloudbuild-viewer",
  {
    project: gcp.config.project!,
    role: "roles/cloudbuild.builds.viewer",
    member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
  },
);

const serviceAccountUserBinding = new gcp.projects.IAMMember(
  "api-sa-service-account-user",
  {
    project: gcp.config.project!,
    role: "roles/iam.serviceAccountUser",
    member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
  },
);

const projectIamAdminBinding = new gcp.projects.IAMMember(
  "api-sa-project-iam-admin",
  {
    project: gcp.config.project!,
    role: "roles/resourcemanager.projectIamAdmin",
    member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
  },
);

// Create a Cloud Run service that is only accessible from the load balancer
const service = new gcp.cloudrunv2.Service(
  "apiservice",
  {
    location: region,
    name: "api", // Explicitly name the service 'api'
    ingress: "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER", // Restrict access to the LB
    template: {
      serviceAccount: serviceAccount.email,
      containers: [
        {
          image: image.repoDigest, // Use the unique repoDigest
          resources: {
            limits: {
              memory: "512Mi",
            },
          },
          envs: envs,
        },
      ],
      scaling: {
        maxInstanceCount: 1,
        minInstanceCount: 0,
      },
      timeout: "600s",
    },
  },
  { dependsOn: [cloudRun] },
);

// Allow invocations from the load balancer (and other internal traffic)
// This is safe because the ingress setting above restricts access to only the LB.
const invoker = new gcp.cloudrunv2.ServiceIamMember("api-invoker", {
  project: service.project,
  location: service.location,
  name: service.name,
  role: "roles/run.invoker",
  member: "allUsers",
});

// Export the URL of the service
export const apiUrl = service.uri;
