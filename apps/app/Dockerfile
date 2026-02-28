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
COPY apps/api/package.json ./apps/api/
COPY apps/app/package.json ./apps/app/
COPY apps/landing/package.json ./apps/landing/
COPY apps/backoffice/package.json ./apps/backoffice/
COPY packages/types/package.json ./packages/types/
COPY packages/config-typescript/package.json ./packages/config-typescript/
COPY packages/config-tailwind/package.json ./packages/config-tailwind/
COPY packages/ui/package.json ./packages/ui/

RUN bun install --frozen-lockfile

# ================================
# Development stage
# ================================
FROM dependencies AS development
COPY . .
EXPOSE 3001
CMD ["bun", "run", "dev:app"]

# ================================
# Builder stage
# ================================
FROM dependencies AS builder
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN bun run turbo build --filter=@tibiaeye/app

# ================================
# Production stage (Nginx for static files)
# ================================
FROM nginx:alpine AS production

COPY --from=builder /app/apps/app/dist /usr/share/nginx/html
COPY apps/app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
