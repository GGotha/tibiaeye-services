# ================================
# Base stage
# ================================
FROM oven/bun:1 AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

# ================================
# Dependencies stage
# ================================
FROM base AS dependencies
COPY package.json bun.lockb turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/config-typescript/package.json ./packages/config-typescript/

RUN bun install --frozen-lockfile

# ================================
# Development stage
# ================================
FROM dependencies AS development
COPY . .
EXPOSE 4000
CMD ["bun", "run", "dev:api"]

# ================================
# Builder stage
# ================================
FROM dependencies AS builder
COPY . .
RUN bun run turbo build --filter=@tibiaeye/api

# ================================
# Production stage
# ================================
FROM base AS production
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

USER bun
EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "dist/server.js"]
