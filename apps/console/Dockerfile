# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
WORKDIR /temp/dev
COPY package.json bun.lock ./
COPY apps/console/package.json apps/console/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/app/package.json packages/app/package.json
COPY packages/utils/package.json packages/utils/package.json
RUN bun install --frozen-lockfile

# install with --production (exclude devDependencies)
FROM base AS install-prod
WORKDIR /temp/prod
COPY package.json bun.lock ./
COPY apps/console/package.json apps/console/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/app/package.json packages/app/package.json
COPY packages/utils/package.json packages/utils/package.json
RUN bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV NODE_ENV=production
COPY --from=install /temp/dev/node_modules ./node_modules
COPY --from=install /temp/dev/apps/console/node_modules ./apps/console/node_modules
COPY --from=install /temp/dev/packages/app/node_modules ./packages/app/node_modules
COPY --from=install /temp/dev/packages/utils/node_modules ./packages/utils/node_modules
COPY . .
RUN bun run --filter=console test
RUN bun run --filter=console build

# copy production dependencies and source code into final image
FROM base AS release
ENV NODE_ENV=production
COPY package.json bun.lock ./
COPY --from=prerelease /usr/src/app/apps/console/package.json ./apps/console/package.json
COPY --from=prerelease /usr/src/app/apps/console/server.ts ./apps/console/server.ts
COPY --from=prerelease /usr/src/app/apps/console/dist ./apps/console/dist
COPY --from=prerelease /usr/src/app/apps/console/public ./apps/console/public
COPY --from=install-prod /temp/prod/node_modules ./node_modules
COPY --from=install-prod /temp/prod/apps/console/node_modules ./apps/console/node_modules
COPY --from=install-prod /temp/prod/packages/app/node_modules ./packages/app/node_modules
COPY --from=install-prod /temp/prod/packages/utils/node_modules ./packages/utils/node_modules
WORKDIR /usr/src/app/apps/console
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "server.ts" ]
