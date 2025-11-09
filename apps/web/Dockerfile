# 1. Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=web --docker

# 2. Installer Stage
FROM node:20-alpine AS installer
WORKDIR /app

# Install bun and turbo
RUN npm install -g bun
RUN npm install -g turbo

# Copy the pruned package.json
COPY --from=builder /app/out/json/ .

# Copy ALL pruned source code FIRST
COPY --from=builder /app/out/full/ .

# Install ONLY the pruned dependencies
RUN bun install

# Build the app
RUN turbo run build --filter=web

# 3. Runner Stage
# 3. Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

# 1. Copy the standalone contents to the root /app
# Based on your image, this creates: /app/apps/web/server.js
COPY --from=installer /app/apps/web/.next/standalone/ ./

# 2. Copy static assets to the EXACT location Next.js expects them
# They need to go inside the apps/web folder now!
COPY --from=installer /app/apps/web/.next/static ./apps/web/.next/static

# 3. Copy public folder to the EXACT location
COPY --from=installer /app/apps/web/public ./apps/web/public

EXPOSE 3000

# 4. Run the server from its actual, confirmed location
CMD ["node", "apps/web/server.js"]