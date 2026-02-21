# TibiaEye Monorepo

Monorepo para o projeto TibiaEye - pixel bot para Tibia com dashboard de monitoramento em tempo real.

## O que é o TibiaEye?

- **Pixel Bot**: Automação que lê pixels da tela do jogo em tempo real
- **Dashboard**: Interface web para monitorar XP/h, kills, loot e posição ao vivo
- **Requisito**: Tela do Tibia precisa estar visível (segundo monitor ou VM recomendado)

## Estrutura

```
apps/
  landing/    # Landing page Next.js - site institucional ✅
  app/        # Dashboard React - painel do usuário
  backoffice/ # Admin React - painel administrativo
  api/        # Backend NestJS - API REST + WebSocket
```

## Comandos

Usar **bun** como package manager:

```bash
bun install          # Instalar dependências
bun run build        # Build de todos os apps
bun run dev          # Dev server
bun run lint         # Linting
bun run test         # Testes
```

## Stack Principal

- **Runtime:** Bun
- **Monorepo:** Turborepo
- **Frontend:** Next.js 16, React 19, Tailwind CSS, Framer Motion
- **Backend:** NestJS, TypeORM, MySQL
- **Real-time:** Socket.io
- **Auth:** JWT
- **Pagamentos:** AbacatePay

## Apps Implementados

### Landing (`apps/landing`) ✅
- **Stack**: Next.js 16.1, TypeScript, Tailwind CSS, Framer Motion
- **Propósito**: Landing page de marketing com pricing e FAQ
- **Porta**: 3000
- **Docs**: `apps/landing/CLAUDE.md`

## Convenções

### Idioma
- Código em inglês
- Textos de UI em português brasileiro (com acentos corretos)
- Documentação em português

### Estilo
- TypeScript strict mode
- Aspas duplas em strings
- Componentes em PascalCase
- Arquivos em kebab-case
- Evitar emojis em código

### Git
- Commits em inglês
- Co-authored por Claude quando aplicável

## Documentação de Especificações

Os arquivos `*.md` na raiz contêm as especificações detalhadas:
- `01-landing-page.md` - Especificação da landing page
- `02-app-dashboard.md` - Especificação do dashboard
- `03-backoffice-admin.md` - Especificação do backoffice
- `04-api-nestjs.md` - Especificação da API
- `05-turborepo-config.md` - Configuração do Turborepo
- `07-production-essentials.md` - Essenciais de produção
