# TibiaEye

Plataforma SaaS de telemetria para bots de Tibia.

## Stack

| App | Tecnologia | Porta |
|-----|------------|-------|
| Landing | NextJS 16 | 3000 |
| App | React + Vite | 3001 |
| Backoffice | React + Vite | 3002 |
| API | NestJS + Bun | 4000 |

## Pre-requisitos

- Bun 1.1+
- Docker (para MySQL)

## Setup

```bash
# Clone o repositorio
git clone https://github.com/seu-usuario/tibiaeye.git
cd tibiaeye

# Instalar dependencias
bun install

# Configurar ambiente
cp .env.example .env

# Subir banco de dados
docker compose up -d mysql

# Rodar migrations
bun run db:migrate

# Rodar todos os apps
bun run dev
```

## Comandos

| Comando | Descricao |
|---------|-----------|
| `bun run dev` | Roda todos os apps em modo desenvolvimento |
| `bun run dev:landing` | Roda apenas a landing page |
| `bun run dev:app` | Roda apenas o app do player |
| `bun run dev:backoffice` | Roda apenas o backoffice |
| `bun run dev:api` | Roda apenas a API |
| `bun run build` | Build de producao de todos os apps |
| `bun run lint` | Lint de todos os apps |
| `bun run test` | Roda testes de todos os apps |
| `bun run format` | Formata codigo com Biome |
| `bun run clean` | Limpa cache e node_modules |

## Estrutura

```
tibiaeye/
├── apps/
│   ├── landing/          # NextJS - Landing page
│   ├── app/              # React - Dashboard players
│   ├── backoffice/       # React - Admin panel
│   └── api/              # NestJS - REST API
├── packages/
│   ├── ui/               # Componentes Shadcn compartilhados
│   ├── types/            # TypeScript types compartilhados
│   ├── config-typescript/# TSConfig base
│   └── config-tailwind/  # Tailwind preset
└── ...
```

## Usando packages compartilhados

```typescript
// Importar componentes
import { Button } from "@tibiaeye/ui/button";
import { Card } from "@tibiaeye/ui/card";

// Importar types
import type { User, Session } from "@tibiaeye/types";
```

## Docker

```bash
# Desenvolvimento com hot reload
bun run docker:dev

# Desenvolvimento com rebuild
bun run docker:dev:build

# Producao
bun run docker:prod:build

# Ver logs
bun run docker:logs

# Parar tudo
bun run docker:down

# Parar e remover volumes (cuidado: apaga dados do MySQL)
bun run docker:down:volumes

# Acessar MySQL
bun run docker:mysql
```

## Deploy

### Vercel (Landing, App, Backoffice)

```bash
# Cada app pode ser deployado separadamente
vercel --cwd apps/landing
vercel --cwd apps/app
vercel --cwd apps/backoffice
```

### Railway/Render (API)

O Dockerfile esta em `apps/api/Dockerfile`.

## License

MIT
