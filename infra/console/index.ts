import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

const consoleConfig = new pulumi.Config("console");

const plainEnvVarNames = [
  "BETTER_AUTH_URL",
  "BASEURL",
  "API_BASEURL",
  "VITE_BASE_URL",
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

const plainBuildArgNames = ["BUILD_DATABASE_SERVERLESS"] as const;
const secretBuildArgNames: readonly string[] = [];

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
    location: "us-central1",
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

// Create a Cloud Run service
const service = new gcp.cloudrun.Service(
  "consoleservice",
  {
    location: "us-central1",
    template: {
      spec: {
        containers: [
          {
            image: image.imageName,
            resources: {
              limits: {
                memory: "512Mi",
              },
            },
            envs,
          },
        ],
      },
      metadata: {
        annotations: {
          "autoscaling.knative.dev/maxScale": "3",
          "autoscaling.knative.dev/minScale": "0",
        },
      },
    },
  },
  { dependsOn: [cloudRun] }
);

// Allow unauthenticated access to the service
const iamMember = new gcp.cloudrun.IamMember("console-iam-member", {
  service: service.name,
  location: "us-central1",
  role: "roles/run.invoker",
  member: "allUsers",
});

// Export the URL of the service
export const url = service.statuses.apply((statuses) => statuses?.[0]?.url);
