# ================================
# Base stage
# ================================
FROM oven/bun:1 AS base
WORKDIR /app

# ================================
# Dependencies stage
# ================================
FROM base AS dependencies
COPY package.json bun.lockb turbo.json ./
COPY apps/backoffice/package.json ./apps/backoffice/
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
EXPOSE 3002
CMD ["bun", "run", "dev:backoffice"]

# ================================
# Builder stage
# ================================
FROM dependencies AS builder
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN bun run turbo build --filter=@tibiaeye/backoffice

# ================================
# Production stage (Nginx for static files)
# ================================
FROM nginx:alpine AS production

COPY --from=builder /app/apps/backoffice/dist /usr/share/nginx/html
COPY apps/backoffice/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]
