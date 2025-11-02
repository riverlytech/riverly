# Dockerfile for apps/console, to be built from the monorepo root

FROM oven/bun:1.3 AS base
WORKDIR /usr/src/app

# keep bun's global cache/downloads across stages to speed up builds
ENV BUN_INSTALL_CACHE_DIR=/var/cache/bun
ENV BUN_INSTALL_BIN_DIR=/usr/local/bin

# Copy only manifest files so dependency installs can be cached.
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/console/package.json apps/console/
COPY apps/api/package.json apps/api/
COPY apps/docs/package.json apps/docs/
COPY apps/worker/package.json apps/worker/
COPY packages/app/package.json packages/app/
COPY packages/utils/package.json packages/utils/
RUN bun install --frozen-lockfile --no-cache

# Build the console application using the shared workspace dependencies.
FROM base AS build
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run --filter=console build

# Install a production-only node_modules tree that can be reused in release.
FROM base AS production
COPY package.json bun.lock ./
COPY apps/console/package.json apps/console/
COPY apps/api/package.json apps/api/
COPY apps/docs/package.json apps/docs/
COPY apps/worker/package.json apps/worker/
COPY packages/app/package.json packages/app/
COPY packages/utils/package.json packages/utils/
RUN bun install --frozen-lockfile --production --no-cache

# Assemble the runtime image.
FROM base AS release
ENV NODE_ENV=production \
    PORT=3000
COPY --from=production /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/bun.lock ./bun.lock
COPY --from=build /usr/src/app/apps/console/package.json ./apps/console/package.json
COPY --from=build /usr/src/app/apps/console/server.ts ./apps/console/server.ts
COPY --from=build /usr/src/app/apps/console/dist ./apps/console/dist

WORKDIR /usr/src/app/apps/console
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "server.ts" ]
