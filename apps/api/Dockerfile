# 1. Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=api --docker

# 2. Installer Stage
FROM node:20-alpine AS installer
WORKDIR /app

# Install bun and turbo
RUN npm install -g bun
RUN npm install -g turbo

# Provide a dummy DATABASE_URL just for the build-time 'prisma generate'
ENV DATABASE_URL="dummy_url_for_build"

# Copy the pruned package.json
COPY --from=builder /app/out/json/ .

# Copy ALL pruned source code FIRST
COPY --from=builder /app/out/full/ .

# Install ONLY the pruned dependencies
RUN bun install

# Build the app
RUN turbo run build --filter=api

# 3. Runner Stage
FROM node:20-alpine AS runner

# Set WORKDIR to the nested api folder so it finds package.json correctly
WORKDIR /app/apps/api

# Copy bun
COPY --from=installer /usr/local/bin/bun /usr/local/bin/bun
COPY --from=installer /usr/local/lib/node_modules/bun /usr/local/lib/node_modules/bun

# Copy the built app
COPY --from=installer /app/apps/api/dist ./dist
# Copy production node_modules to the MONOREPO ROOT and the API FOLDER
COPY --from=installer /app/node_modules ../../node_modules
COPY --from=installer /app/apps/api/node_modules ./node_modules

# Copy package.json and prisma
COPY --from=installer /app/apps/api/package.json .
COPY --from=installer /app/apps/api/prisma ./prisma

COPY --from=builder /app/apps/data /app/data
EXPOSE 3001

# Run from inside /app/apps/api
CMD ["sh", "-c", "bun x prisma migrate deploy && bun run seed && bun run start"]