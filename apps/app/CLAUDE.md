# TibiaEye Dashboard (App)

Dashboard React para usuários visualizarem métricas de bot: XP/h, kills, loot e mapa em tempo real.

## Stack

- **Framework:** React 18 + Vite
- **Linguagem:** TypeScript
- **Roteamento:** TanStack Router (file-based routing)
- **Data Fetching:** TanStack Query (React Query)
- **Estado:** React Context API + useReducer (NÃO usar Zustand)
- **HTTP Client:** Axios
- **Real-time:** Socket.io-client
- **Styling:** Tailwind CSS + Shadcn/ui (Radix primitives)
- **Charts:** Recharts
- **Linting:** Biome
- **Testes:** Vitest + Testing Library

## Comandos

```bash
bun run dev       # Dev server (porta 3001)
bun run build     # Build de produção
bun run lint      # Verificar linting
bun run lint:fix  # Corrigir linting
bun run test      # Rodar testes (watch)
bun run test:run  # Rodar testes (single run)
```

## Estrutura de Diretórios

```
src/
  components/     # Componentes React
    ui/           # Componentes base (Shadcn/ui)
    cards/        # Cards de dashboard
    charts/       # Gráficos (Recharts)
    layout/       # Layout (Sidebar, Header)
    map/          # Componente de mapa
    tables/       # Tabelas
  contexts/       # React Contexts (auth)
  hooks/          # Custom hooks (TanStack Query)
  lib/            # Utilitários (api.ts, utils.ts, socket.ts)
  routes/         # Rotas (TanStack Router file-based)
    auth/         # Rotas de autenticação
    dashboard/    # Rotas do dashboard
  types/          # TypeScript types
  __tests__/      # Testes
```

## Convenções

### Rotas (TanStack Router)
- Usar file-based routing em `src/routes/`
- Rotas de index usam `index.tsx`
- Rotas dinâmicas usam `$param.tsx`
- Links NÃO devem ter trailing slash (ex: `/dashboard/sessions` não `/dashboard/sessions/`)

### API Client (Axios)
- Cliente centralizado em `src/lib/api.ts`
- Interceptors para auth token e tratamento de erros
- Métodos tipados para cada endpoint

### Hooks (TanStack Query)
- Um arquivo por domínio em `src/hooks/`
- Prefixo `use` + nome do recurso (ex: `useSessions`, `useCharacters`)
- Mutations com invalidação de cache

### Componentes
- Componentes UI base em `src/components/ui/`
- Usar `cn()` para merge de classes Tailwind
- Props tipadas com interfaces

### Estado de Auth
- Usar `AuthContext` via `useAuth()` hook
- NÃO usar Zustand ou outras libs de estado global

## Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:3333  # URL da API
```

## Arquivos Ignorados pelo Linter

- `src/routeTree.gen.ts` - Gerado automaticamente pelo TanStack Router
