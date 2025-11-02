# Riverly Console Infrastructure

This Pulumi project manages the infrastructure for the Riverly Console application, which is deployed to Google Cloud Run.

## Prerequisites

- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [Docker](https://docs.docker.com/get-docker/)
- [Bun](https://bun.sh/)

## Setup

1.  **Login to Pulumi:**

    ```bash
    pulumi login gs://a0run-pulumi-state-devel
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

## Deployment

1.  **Deploy the infrastructure:**

    ```bash
    pulumi up
    ```

This will deploy the following resources:

- A Google Artifact Registry repository to store the Docker image.
- A Google Cloud Run service to run the application.
- The necessary IAM policies to allow public access to the service.
