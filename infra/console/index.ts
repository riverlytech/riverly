import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

const consoleConfig = new pulumi.Config("console");

const plainEnvVarNames = [
  "BETTER_AUTH_URL",
  "BASEURL",
  "API_BASEURL",
  "VITE_BASE_URL",
  "VITE_GITHUB_APP_INSTALL_URL",
] as const;

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

const plainBuildArgNames = [
  "VITE_BASE_URL",
  "VITE_GITHUB_APP_INSTALL_URL",
] as const;
const secretBuildArgNames: readonly string[] = [];
const optionalPlainBuildArgNames = ["BUILD_DATABASE_SERVERLESS"] as const;

const region =
  gcp.config.region ?? consoleConfig.get("region") ?? "us-central1";

const envs = [
  ...plainEnvVarNames.map((name) => ({
    name,
    value: consoleConfig.require(name),
  })),
  ...secretEnvVarNames.map((name) => ({
    name,
    value: consoleConfig.requireSecret(name),
  })),
];

const buildArgs: Record<string, pulumi.Input<string>> = {
  ...Object.fromEntries(
    plainBuildArgNames.map((name) => [name, consoleConfig.require(name)])
  ),
  ...Object.fromEntries(
    secretBuildArgNames.map((name) => [name, consoleConfig.requireSecret(name)])
  ),
  ...(() => {
    const optionalArgs: Record<string, pulumi.Input<string>> = {};
    for (const name of optionalPlainBuildArgNames) {
      const value = consoleConfig.get(name);
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
  "consolerepo",
  {
    location: region,
    repositoryId: "consolerepo",
    format: "DOCKER",
  },
  { dependsOn: [artifactRegistry] }
);

// Get the repository URL
const repositoryUrl = pulumi.interpolate`${repository.location}-docker.pkg.dev/${gcp.config.project}/${repository.name}`;

// Build and publish the Docker image
const image = new docker.Image(
  "consoleimage",
  {
    imageName: pulumi.interpolate`${repositoryUrl}/console`,
    build: {
      context: "../../",
      dockerfile: "../../apps/console/Dockerfile",
      platform: "linux/amd64",
      args: buildArgs,
    },
  },
  { dependsOn: [cloudBuild] }
);

// Create a Cloud Run service that is only accessible from the load balancer
const service = new gcp.cloudrunv2.Service(
  "consoleservice",
  {
    location: region,
    name: "console", // Explicitly name the service 'console'
    ingress: "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER", // Restrict access to the LB
    template: {
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
        maxInstanceCount: 3,
        minInstanceCount: 0,
      },
    },
  },
  { dependsOn: [cloudRun] }
);

// Allow invocations from the load balancer (and other internal traffic)
// This is safe because the ingress setting above restricts access to only the LB.
const invoker = new gcp.cloudrunv2.ServiceIamMember("invoker", {
  project: service.project,
  location: service.location,
  name: service.name,
  role: "roles/run.invoker",
  member: "allUsers",
});

// Export the URL of the service
export const url = service.uri;
