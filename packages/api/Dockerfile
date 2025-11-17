# Use the official Bun image
# See all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3 AS base
WORKDIR /usr/src/app

# Install dependencies(all) into temp directory
# This includes dependencies and dev-dependencies
# We only copy package.json required for pulling dependencies
FROM base AS install
WORKDIR /temp/dev
# root
COPY package.json bun.lock ./
# applications
COPY packages/console/package.json packages/console/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/worker/package.json packages/worker/package.json
# modules 
COPY packages/riverly/package.json packages/riverly/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/utils/package.json packages/utils/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/ty/package.json packages/ty/package.json
RUN bun install --frozen-lockfile

# Build the application with installed dependencies
# This also copies the sources required for build and dependencies from previous step
FROM base AS build
ENV NODE_ENV=production
COPY --from=install /temp/dev/node_modules ./node_modules
# root
COPY package.json bun.lock ./
# modules
COPY packages/riverly ./packages/riverly
COPY packages/db ./packages/db
COPY packages/utils ./packages/utils
COPY packages/config ./packages/config
COPY packages/ty ./packages/ty
# application
COPY packages/api ./packages/api
# build application
# This generates build artifact
WORKDIR /usr/src/app/packages/api
RUN bun run build

# This installs production dependencies
# Production dependencies are later copied for production
FROM base AS release
ENV NODE_ENV=production
# root
COPY package.json bun.lock ./
# applications
COPY packages/console/package.json packages/console/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/worker/package.json packages/worker/package.json
# modules 
COPY packages/riverly/package.json packages/riverly/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/utils/package.json packages/utils/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/ty/package.json packages/ty/package.json
RUN bun install --frozen-lockfile --production

FROM base AS production
ENV NODE_ENV=production
COPY --from=release /usr/src/app/node_modules ./node_modules
COPY --from=release /usr/src/app/packages/api/package.json packages/api/package.json
COPY --from=build /usr/src/app/packages/api/dist packages/api/dist

WORKDIR /usr/src/app/packages/api
USER bun
EXPOSE 5000/tcp
ENTRYPOINT [ "bun", "run", "start" ]
