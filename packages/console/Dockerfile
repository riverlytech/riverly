# Use the official Bun image
# See all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3 AS base
WORKDIR /usr/src/app

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
WORKDIR /temp/dev
COPY package.json bun.lock ./
# Copy all workspace package.json files (required for lockfile validation)
COPY apps/console/package.json apps/console/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/app/package.json packages/app/package.json
COPY packages/utils/package.json packages/utils/package.json
RUN bun install --frozen-lockfile

# Build stage - copy source code and build the application
FROM base AS prerelease
# Build-time environment variables for Vite
ARG VITE_BASE_URL
ARG VITE_GITHUB_APP_INSTALL_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_GITHUB_APP_INSTALL_URL=$VITE_GITHUB_APP_INSTALL_URL
ENV NODE_ENV=production

# Copy root dependencies
COPY --from=install /temp/dev/node_modules ./node_modules
COPY package.json bun.lock ./

# Copy workspace packages source code (required for Bun workspaces)
COPY packages/app ./packages/app
COPY packages/utils ./packages/utils

# Copy console app
COPY apps/console ./apps/console

# Build the application
WORKDIR /usr/src/app/apps/console
RUN bun run build

# Production stage - minimal runtime image
FROM base AS release
ENV NODE_ENV=production

# Copy root package files
COPY package.json bun.lock ./

# Copy all workspace package.json files (required for lockfile validation)
COPY apps/console/package.json apps/console/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/app/package.json packages/app/package.json
COPY packages/utils/package.json packages/utils/package.json

# Install production dependencies first (before copying source code)
RUN bun install --frozen-lockfile --production

# Copy workspace packages source code (needed for runtime)
COPY packages/app/src packages/app/src
COPY packages/app/drizzle.config.ts packages/app/drizzle.config.ts
COPY packages/app/migrations packages/app/migrations
COPY packages/utils/src packages/utils/src

# Copy console app production artifacts
COPY --from=prerelease /usr/src/app/apps/console/dist apps/console/dist
COPY --from=prerelease /usr/src/app/apps/console/public apps/console/public
COPY apps/console/server.ts apps/console/server.ts

WORKDIR /usr/src/app/apps/console
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "server.ts" ]
