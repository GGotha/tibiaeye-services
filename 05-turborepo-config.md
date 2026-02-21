# Tarefa: Configurar Turborepo Monorepo

## Contexto
Após todos os apps serem criados, configurar o Turborepo para orquestrar o monorepo.

## Pré-requisitos
Os seguintes diretórios devem existir:
- apps/landing (NextJS)
- apps/app (React + Vite)
- apps/backoffice (React + Vite)
- apps/api (NestJS)

## Estrutura Final
```
tibia-telemetry/
├── apps/
│   ├── landing/
│   ├── app/
│   ├── backoffice/
│   └── api/
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config-eslint/
│   ├── config-typescript/
│   └── config-tailwind/
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── biome.json
├── .gitignore
├── .env.example
└── README.md
```

## Arquivos a Criar

### Root package.json
```json
{
  "name": "tibia-telemetry",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "dev:landing": "turbo dev --filter=@tibia/landing",
    "dev:app": "turbo dev --filter=@tibia/app",
    "dev:backoffice": "turbo dev --filter=@tibia/backoffice",
    "dev:api": "turbo dev --filter=@tibia/api",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "format": "biome format --write .",
    "check": "biome check --apply .",
    "clean": "turbo clean && rm -rf node_modules",
    "db:migrate": "turbo db:migrate --filter=@tibia/api",
    "db:seed": "turbo db:seed --filter=@tibia/api"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.5.0",
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  },
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": ["NODE_ENV"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["VITE_API_URL", "NEXT_PUBLIC_*"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### biome.json (root)
```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noForEach": "off"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "es5"
    }
  }
}
```

---

## Packages

### packages/ui/package.json
```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "exports": {
    "./button": "./src/components/button.tsx",
    "./card": "./src/components/card.tsx",
    "./input": "./src/components/input.tsx",
    "./select": "./src/components/select.tsx",
    "./table": "./src/components/table.tsx",
    "./tabs": "./src/components/tabs.tsx",
    "./dialog": "./src/components/dialog.tsx",
    "./dropdown-menu": "./src/components/dropdown-menu.tsx",
    "./avatar": "./src/components/avatar.tsx",
    "./badge": "./src/components/badge.tsx",
    "./skeleton": "./src/components/skeleton.tsx",
    "./toast": "./src/components/toast.tsx",
    "./accordion": "./src/components/accordion.tsx",
    "./lib/utils": "./src/lib/utils.ts"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.344.0",
    "tailwind-merge": "^2.2.1"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@repo/config-typescript": "workspace:*",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

### packages/ui/src/lib/utils.ts
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### packages/ui/src/components/button.tsx
```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### packages/ui/src/components/card.tsx
```tsx
import * as React from "react";
import { cn } from "../lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### packages/types/package.json
```json
{
  "name": "@repo/types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "devDependencies": {
    "@repo/config-typescript": "workspace:*",
    "typescript": "^5.3.0"
  }
}
```

### packages/types/src/index.ts
```typescript
// ========== User ==========
export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended" | "banned";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithDetails extends User {
  subscription: Subscription | null;
  characters: Character[];
  activeLicense: ApiKey | null;
}

// ========== Character ==========
export interface Character {
  id: string;
  userId: string;
  name: string;
  world: string;
  level: number | null;
  vocation: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterWithStatus extends Character {
  hasActiveSession: boolean;
  activeSessionId: string | null;
}

// ========== Subscription ==========
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "past_due" | "trialing";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxCharacters: number;
  historyDays: number;
  apiRequestsPerDay: number;
  features: string[];
  isActive: boolean;
}

// ========== API Key / License ==========
export type LicenseStatus = "active" | "expired" | "revoked";

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  status: LicenseStatus;
  expiresAt: string;
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  totalRequests: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyWithUser extends ApiKey {
  user: {
    email: string;
    name: string | null;
  };
  daysRemaining: number;
  isExpired: boolean;
  isValid: boolean;
}

export interface LicenseValidationResult {
  valid: boolean;
  userId?: string;
  status?: LicenseStatus;
  expiresAt?: string;
  daysRemaining?: number;
  message?: string;
}

export interface LicenseStatusResponse {
  hasLicense: boolean;
  status: LicenseStatus | null;
  expiresAt: string | null;
  daysRemaining: number;
  keys: Array<{
    id: string;
    name: string;
    keyPrefix: string;
    status: LicenseStatus;
    expiresAt: string;
    createdAt: string;
  }>;
}

// ========== Session ==========
export type SessionStatus = "active" | "completed" | "crashed";

export interface Session {
  id: string;
  characterId: string;
  huntLocation: string | null;
  status: SessionStatus;
  startedAt: string;
  endedAt: string | null;
  initialLevel: number | null;
  initialExperience: string | null;
  finalLevel: number | null;
  finalExperience: string | null;
  totalKills: number;
  totalExperience: string;
  totalLootValue: number;
}

export interface SessionWithCharacter extends Session {
  character: Character;
}

export interface SessionStats {
  totalKills: number;
  totalExperience: number;
  totalLootValue: number;
  xpPerHour: number;
  duration: number;
}

// ========== Analytics ==========
export interface KillsByCreature {
  creatureName: string;
  totalKills: number;
  totalExperience: number;
}

export interface ExperienceDataPoint {
  timestamp: string;
  xpPerHour: number;
  level: number;
}

export interface LootItem {
  itemName: string;
  totalQuantity: number;
  totalValue: number;
}

export interface LootSummary {
  items: LootItem[];
  totalValue: number;
}

// ========== Realtime ==========
export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface RealtimePosition extends Position {
  sessionId: string;
  timestamp: number;
}

// ========== Events ==========
export interface GenericEvent {
  id: string;
  sessionId: string;
  eventType: "death" | "level_up" | "refill" | string;
  data: Record<string, any>;
  createdAt: string;
}

// ========== Admin Analytics ==========
export interface PlatformStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  botsOnlineNow: number;
  sessionsToday: number;
  newUsersToday: number;
  churnRate: number;
}

export interface UsageMetrics {
  date: string;
  apiRequests: number;
  activeSessions: number;
  newUsers: number;
  activeUsers: number;
}

export interface RevenueMetrics {
  date: string;
  revenue: number;
  newSubscriptions: number;
  cancellations: number;
  mrr: number;
}

export interface EndpointStats {
  endpoint: string;
  method: string;
  totalRequests: number;
  avgLatency: number;
  errorRate: number;
}

export interface FeatureFlags {
  maintenanceMode: boolean;
  signupsEnabled: boolean;
  newPricingEnabled: boolean;
  betaFeaturesEnabled: boolean;
}

export interface ActiveSession extends Session {
  user: {
    email: string;
  };
}

// ========== Pagination ==========
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== API Responses ==========
export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiKeyCreateResponse {
  key: string;
  apiKey: ApiKey;
}
```

### packages/config-typescript/base.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "strict": true,
    "strictNullChecks": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### packages/config-typescript/react.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

### packages/config-typescript/package.json
```json
{
  "name": "@repo/config-typescript",
  "version": "0.0.0",
  "private": true,
  "files": [
    "base.json",
    "react.json"
  ]
}
```

### packages/config-tailwind/tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter var", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### packages/config-tailwind/package.json
```json
{
  "name": "@repo/config-tailwind",
  "version": "0.0.0",
  "private": true,
  "main": "tailwind.config.js",
  "dependencies": {
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.1"
  }
}
```

---

## Root Files

### .env.example
```bash
# ============================================
# Database
# ============================================
DATABASE_URL=mysql://root:root@localhost:3306/tibia_telemetry
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=tibia_telemetry

# ============================================
# JWT
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# ============================================
# AbacatePay
# ============================================
ABACATEPAY_API_KEY=
ABACATEPAY_WEBHOOK_SECRET=
ABACATEPAY_PRO_MONTHLY_PRICE_ID=
ABACATEPAY_PRO_YEARLY_PRICE_ID=
ABACATEPAY_ENTERPRISE_MONTHLY_PRICE_ID=
ABACATEPAY_ENTERPRISE_YEARLY_PRICE_ID=

# ============================================
# URLs (Development)
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000

# ============================================
# URLs (Production)
# ============================================
# NEXT_PUBLIC_APP_URL=https://app.tibiaeye.com
# NEXT_PUBLIC_API_URL=https://api.tibiaeye.com
# VITE_API_URL=https://api.tibiaeye.com
```

### .gitignore
```gitignore
# Dependencies
node_modules
.pnpm-store

# Build outputs
dist
.next
.turbo
out

# Environment
.env
.env.local
.env.*.local

# IDE
.idea
.vscode
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Testing
coverage
.nyc_output

# Cache
.cache
*.tsbuildinfo
```

### README.md
```markdown
# TibiaEye

Plataforma SaaS de telemetria para bots de Tibia.

## Stack

| App | Tecnologia | Porta |
|-----|------------|-------|
| Landing | NextJS 14 | 3000 |
| App | React + Vite | 3001 |
| Backoffice | React + Vite | 3002 |
| API | NestJS + Bun | 4000 |

## Pré-requisitos

- Node.js 18+
- pnpm 8+
- Docker (para MySQL)

## Setup

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/tibia-telemetry.git
cd tibia-telemetry

# Instalar dependências
pnpm install

# Configurar ambiente
cp .env.example .env

# Subir banco de dados
docker-compose up -d mysql

# Rodar migrations
pnpm db:migrate

# Rodar todos os apps
pnpm dev
```

## Comandos

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Roda todos os apps em modo desenvolvimento |
| `pnpm dev:landing` | Roda apenas a landing page |
| `pnpm dev:app` | Roda apenas o app do player |
| `pnpm dev:backoffice` | Roda apenas o backoffice |
| `pnpm dev:api` | Roda apenas a API |
| `pnpm build` | Build de produção de todos os apps |
| `pnpm lint` | Lint de todos os apps |
| `pnpm test` | Roda testes de todos os apps |
| `pnpm format` | Formata código com Biome |
| `pnpm clean` | Limpa cache e node_modules |

## Estrutura

```
tibia-telemetry/
├── apps/
│   ├── landing/          # NextJS - Landing page
│   ├── app/              # React - Dashboard players
│   ├── backoffice/       # React - Admin panel
│   └── api/              # NestJS - REST API
├── packages/
│   ├── ui/               # Componentes Shadcn compartilhados
│   ├── types/            # TypeScript types compartilhados
│   ├── config-eslint/    # Config ESLint
│   ├── config-typescript/# TSConfig base
│   └── config-tailwind/  # Tailwind preset
└── ...
```

## Usando packages compartilhados

```typescript
// Importar componentes
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";

// Importar types
import type { User, Session } from "@repo/types";
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

O Dockerfile está em `apps/api/Dockerfile`.

## License

MIT
```

---

## Tarefas de Execução

1. Criar estrutura de diretórios:
```bash
mkdir -p tibia-telemetry/{apps,packages}
mkdir -p tibia-telemetry/packages/{ui/src/{components,lib},types/src,config-typescript,config-tailwind,config-eslint}
```

2. Criar todos os package.json dos packages

3. Criar arquivos de configuração root (turbo.json, pnpm-workspace.yaml, etc)

4. Mover os apps criados pelos outros prompts para apps/

5. Atualizar imports nos apps para usar @repo/*:
```typescript
// Antes
import { Button } from "@/components/ui/button";

// Depois
import { Button } from "@repo/ui/button";
```

6. Atualizar tsconfig.json dos apps:
```json
{
  "extends": "@repo/config-typescript/react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

7. Testar:
```bash
pnpm install
pnpm dev
```

## Checklist de Validação

```markdown
- [ ] `pnpm install` na root funciona sem erros
- [ ] `pnpm dev` inicia todos os 4 apps
- [ ] Landing em http://localhost:3000
- [ ] App em http://localhost:3001
- [ ] Backoffice em http://localhost:3002
- [ ] API em http://localhost:4000
- [ ] `pnpm build` funciona
- [ ] Imports de @repo/ui funcionam em todos os apps
- [ ] Imports de @repo/types funcionam em todos os apps
- [ ] Hot reload funciona em todos os apps
```

---

## Docker

### Estrutura de Arquivos Docker
```
tibia-telemetry/
├── docker-compose.yml          # Orquestra todos os serviços
├── docker-compose.dev.yml      # Override para desenvolvimento
├── docker-compose.prod.yml     # Override para produção
├── apps/
│   ├── landing/
│   │   └── Dockerfile
│   ├── app/
│   │   └── Dockerfile
│   ├── backoffice/
│   │   └── Dockerfile
│   └── api/
│       └── Dockerfile
└── .dockerignore
```

### docker-compose.yml (Base)
```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    container_name: tibiaeye-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DATABASE_PASSWORD:-root}
      MYSQL_DATABASE: ${DATABASE_NAME:-tibia_telemetry}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - tibiaeye-network

  redis:
    image: redis:7-alpine
    container_name: tibiaeye-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - tibiaeye-network

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: tibiaeye-api
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      DATABASE_HOST: mysql
      DATABASE_PORT: 3306
      DATABASE_USER: root
      DATABASE_PASSWORD: ${DATABASE_PASSWORD:-root}
      DATABASE_NAME: ${DATABASE_NAME:-tibia_telemetry}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET:-your-secret-key}
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - tibiaeye-network

  landing:
    build:
      context: .
      dockerfile: apps/landing/Dockerfile
    container_name: tibiaeye-landing
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:4000}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:-http://localhost:3001}
    depends_on:
      - api
    networks:
      - tibiaeye-network

  app:
    build:
      context: .
      dockerfile: apps/app/Dockerfile
    container_name: tibiaeye-app
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      VITE_API_URL: ${VITE_API_URL:-http://localhost:4000}
    depends_on:
      - api
    networks:
      - tibiaeye-network

  backoffice:
    build:
      context: .
      dockerfile: apps/backoffice/Dockerfile
    container_name: tibiaeye-backoffice
    ports:
      - "3002:3002"
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      VITE_API_URL: ${VITE_API_URL:-http://localhost:4000}
    depends_on:
      - api
    networks:
      - tibiaeye-network

volumes:
  mysql_data:
  redis_data:

networks:
  tibiaeye-network:
    driver: bridge
```

### docker-compose.dev.yml (Desenvolvimento com Hot Reload)
```yaml
version: "3.8"

services:
  api:
    build:
      target: development
    volumes:
      - ./apps/api/src:/app/apps/api/src
      - ./packages:/app/packages
    command: pnpm dev:api

  landing:
    build:
      target: development
    volumes:
      - ./apps/landing/src:/app/apps/landing/src
      - ./packages:/app/packages
    command: pnpm dev:landing

  app:
    build:
      target: development
    volumes:
      - ./apps/app/src:/app/apps/app/src
      - ./packages:/app/packages
    command: pnpm dev:app

  backoffice:
    build:
      target: development
    volumes:
      - ./apps/backoffice/src:/app/apps/backoffice/src
      - ./packages:/app/packages
    command: pnpm dev:backoffice
```

### docker-compose.prod.yml (Produção)
```yaml
version: "3.8"

services:
  api:
    build:
      target: production
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  landing:
    build:
      target: production
    restart: unless-stopped

  app:
    build:
      target: production
    restart: unless-stopped

  backoffice:
    build:
      target: production
    restart: unless-stopped

  mysql:
    restart: unless-stopped

  redis:
    restart: unless-stopped
```

### apps/api/Dockerfile (NestJS + Bun)
```dockerfile
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
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/config-typescript/package.json ./packages/config-typescript/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

# ================================
# Development stage
# ================================
FROM dependencies AS development
COPY . .
EXPOSE 4000
CMD ["pnpm", "dev:api"]

# ================================
# Builder stage
# ================================
FROM dependencies AS builder
COPY . .
RUN pnpm turbo build --filter=@tibia/api

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
CMD ["bun", "run", "dist/main.js"]
```

### apps/landing/Dockerfile (Next.js)
```dockerfile
# ================================
# Base stage
# ================================
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# ================================
# Dependencies stage
# ================================
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/landing/package.json ./apps/landing/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY packages/config-typescript/package.json ./packages/config-typescript/
COPY packages/config-tailwind/package.json ./packages/config-tailwind/

RUN pnpm install --frozen-lockfile

# ================================
# Development stage
# ================================
FROM dependencies AS development
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev:landing"]

# ================================
# Builder stage
# ================================
FROM dependencies AS builder
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN pnpm turbo build --filter=@tibia/landing

# ================================
# Production stage
# ================================
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/landing/.next/standalone ./
COPY --from=builder /app/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=builder /app/apps/landing/public ./apps/landing/public

USER node
EXPOSE 3000

CMD ["node", "apps/landing/server.js"]
```

### apps/app/Dockerfile (React + Vite)
```dockerfile
# ================================
# Base stage
# ================================
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# ================================
# Dependencies stage
# ================================
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/app/package.json ./apps/app/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY packages/config-typescript/package.json ./packages/config-typescript/
COPY packages/config-tailwind/package.json ./packages/config-tailwind/

RUN pnpm install --frozen-lockfile

# ================================
# Development stage
# ================================
FROM dependencies AS development
COPY . .
EXPOSE 3001
CMD ["pnpm", "dev:app"]

# ================================
# Builder stage
# ================================
FROM dependencies AS builder
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm turbo build --filter=@tibia/app

# ================================
# Production stage (Nginx para servir arquivos estáticos)
# ================================
FROM nginx:alpine AS production

COPY --from=builder /app/apps/app/dist /usr/share/nginx/html
COPY apps/app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
```

### apps/backoffice/Dockerfile (React + Vite)
```dockerfile
# ================================
# Base stage
# ================================
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# ================================
# Dependencies stage
# ================================
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backoffice/package.json ./apps/backoffice/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY packages/config-typescript/package.json ./packages/config-typescript/
COPY packages/config-tailwind/package.json ./packages/config-tailwind/

RUN pnpm install --frozen-lockfile

# ================================
# Development stage
# ================================
FROM dependencies AS development
COPY . .
EXPOSE 3002
CMD ["pnpm", "dev:backoffice"]

# ================================
# Builder stage
# ================================
FROM dependencies AS builder
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm turbo build --filter=@tibia/backoffice

# ================================
# Production stage (Nginx para servir arquivos estáticos)
# ================================
FROM nginx:alpine AS production

COPY --from=builder /app/apps/backoffice/dist /usr/share/nginx/html
COPY apps/backoffice/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]
```

### apps/app/nginx.conf (e apps/backoffice/nginx.conf)
```nginx
server {
    listen 3001;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### .dockerignore
```dockerignore
# Dependencies
node_modules
**/node_modules

# Build outputs
dist
.next
.turbo
out

# Git
.git
.gitignore

# Environment
.env
.env.*
!.env.example

# IDE
.idea
.vscode
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Testing
coverage
.nyc_output

# Documentation
*.md
!README.md

# Docker
Dockerfile*
docker-compose*
.dockerignore
```

### Comandos Docker no package.json (root)

Adicionar estes scripts no `package.json` da root:

```json
{
  "scripts": {
    "docker:dev": "docker-compose -f docker-compose.yml -f docker-compose.dev.yml up",
    "docker:dev:build": "docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build",
    "docker:prod": "docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d",
    "docker:prod:build": "docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build",
    "docker:down": "docker-compose down",
    "docker:down:volumes": "docker-compose down -v",
    "docker:logs": "docker-compose logs -f",
    "docker:logs:api": "docker-compose logs -f api",
    "docker:ps": "docker-compose ps",
    "docker:mysql": "docker-compose exec mysql mysql -uroot -proot tibia_telemetry"
  }
}
```

### Uso

```bash
# Desenvolvimento com hot reload
pnpm docker:dev

# Desenvolvimento com rebuild
pnpm docker:dev:build

# Produção
pnpm docker:prod:build

# Ver logs
pnpm docker:logs

# Parar tudo
pnpm docker:down

# Parar e remover volumes (cuidado: apaga dados do MySQL)
pnpm docker:down:volumes

# Acessar MySQL
pnpm docker:mysql
```

---

## Não fazer
- Não modificar código interno dos apps (apenas imports)
- Não criar apps novos, apenas configurar o monorepo
