# ================================
# Base stage
# ================================
FROM oven/bun:1 AS base
WORKDIR /app

# ================================
# Dependencies stage
# ================================
FROM base AS dependencies
COPY package.json bun.lock turbo.json ./
COPY apps/landing/package.json ./apps/landing/
COPY apps/app/package.json ./apps/app/
COPY apps/backoffice/package.json ./apps/backoffice/
COPY apps/api/package.json ./apps/api/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY packages/config-typescript/package.json ./packages/config-typescript/
COPY packages/config-tailwind/package.json ./packages/config-tailwind/

RUN bun install --frozen-lockfile

# ================================
# Development stage
# ================================
FROM dependencies AS development
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev:landing"]

# ================================
# Builder stage
# ================================
FROM dependencies AS builder
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN bun run turbo build --filter=@tibiaeye/landing

# ================================
# Production stage
# ================================
FROM oven/bun:1-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/landing/.next/standalone ./
COPY --from=builder /app/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=builder /app/apps/landing/public ./apps/landing/public

USER bun
EXPOSE 3000

CMD ["bun", "run", "apps/landing/server.js"]
