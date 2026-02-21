# Tarefa: Criar App Dashboard para Players do TibiaEye

## Contexto
Dashboard onde players visualizam métricas do bot: XP/h, kills, loot, mapa em tempo real.
Autenticação JWT, consumir API REST.

## Stack
- React 18+
- Vite
- TypeScript
- TanStack Query (React Query)
- TanStack Router
- React Context API (state management) - **NÃO usar Zustand**, preferir Context + useReducer nativo do React
- Tailwind CSS
- Shadcn/ui (incluindo shadcn/ui charts para gráficos)
  - Para adicionar componentes: `pnpm dlx shadcn@latest add <component>`
  - Exemplo: `pnpm dlx shadcn@latest add alert`
- Socket.io-client (real-time)
- Biome (linting/formatting)
- Vitest (testes)
- **Icons**: lucide-react (preferido) ou @phosphor-icons/react

## Estrutura de Arquivos
```
apps/app/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   └── forgot-password.tsx
│   │   └── dashboard/
│   │       ├── index.tsx          # Overview
│   │       ├── characters/
│   │       │   ├── index.tsx      # Lista de characters
│   │       │   └── [id].tsx       # Detalhes do character
│   │       ├── sessions/
│   │       │   ├── index.tsx      # Lista (destaque sessão ativa)
│   │       │   └── [id].tsx       # Detalhes da sessão
│   │       ├── analytics/
│   │       │   ├── index.tsx
│   │       │   ├── experience.tsx
│   │       │   ├── kills.tsx
│   │       │   └── loot.tsx
│   │       ├── live-map/
│   │       │   └── index.tsx
│   │       ├── license/
│   │       │   └── index.tsx      # License + API Keys
│   │       └── settings/
│   │           ├── profile.tsx
│   │           └── billing.tsx
│   ├── components/
│   │   ├── ui/                    # Importados de @repo/ui
│   │   ├── charts/
│   │   │   ├── xp-chart.tsx
│   │   │   ├── kills-chart.tsx
│   │   │   └── loot-chart.tsx
│   │   ├── tables/
│   │   │   ├── sessions-table.tsx
│   │   │   └── kills-table.tsx
│   │   ├── cards/
│   │   │   ├── stats-card.tsx
│   │   │   └── session-card.tsx
│   │   ├── map/
│   │   │   └── live-map.tsx
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       └── mobile-nav.tsx
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-sessions.ts
│   │   ├── use-analytics.ts
│   │   └── use-realtime.ts
│   ├── lib/
│   │   ├── api.ts                 # API client (fetch)
│   │   ├── auth.ts                # Auth helpers
│   │   └── utils.ts
│   ├── stores/
│   │   ├── auth-store.ts
│   │   └── ui-store.ts
│   └── types/
│       └── index.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── biome.json
└── index.html
```

## Funcionalidades por Página

### Auth
- Login com email/senha (POST /api/v1/auth/login)
- Signup (POST /api/v1/auth/register)
- Forgot password (POST /api/v1/auth/forgot-password)
- Protected routes com JWT

### Dashboard Overview
- **License Status Card**: Dias restantes, status, botão renovar
- **Active Session Banner**: Se há sessão ativa, mostra character + stats em tempo real
- 4 cards de métricas (XP/h, kills hoje, loot value, tempo online)
- Gráfico XP/h últimas 24h
- Lista últimas 5 sessões
- Quick actions: Ver Live Map, Gerenciar Characters

### Characters (NOVO)
- Lista de characters cadastrados do usuário
- Badge "ONLINE" se character tem sessão ativa
- Adicionar novo character (nome + world)
- Para cada character:
  - Ver sessões desse character
  - Editar/remover character
  - Stats totais do character

### Sessions (Histórico)
- **Sessão Ativa (destaque)**: Card grande no topo se houver
- **Sessões Passadas**: Tabela com filtros
  - Filtro por character
  - Filtro por data
  - Filtro por status
- Paginação
- Link para detalhes

### Session Detail [id]
- Header com status (Active/Completed/Crashed)
- Se ativa: stats em tempo real via WebSocket
- Resumo da sessão (duração, XP total, kills, loot)
- Gráfico XP/h durante a sessão
- Tabs:
  - **Timeline**: Eventos em ordem cronológica
  - **Kills**: Lista de kills por criatura
  - **Loot**: Lista de loot com valores
  - **Map**: Caminho percorrido (se houver dados)

### Analytics
- Gráficos interativos por período
- Comparativo entre sessões
- Filtro por character
- Export CSV

### Live Map
- Canvas com mapa do Tibia
- Posição em tempo real via WebSocket
- Dropdown para selecionar sessão ativa
- Floor selector (0-15)
- Zoom controls
- Mini stats overlay

### License & API Keys (NOVO - combinado)
- **License Status**:
  - Card grande com status atual
  - Dias restantes com progress bar
  - Botão "Renovar Subscription"
  - Histórico de pagamentos
- **API Keys**:
  - Key ativa (mostrando tm_xxxx****)
  - Botão copiar key completa (mostra apenas 1x ao criar)
  - Data de expiração
  - Gerar nova key (revoga a anterior)

### Settings
- Formulário de perfil (nome, avatar)
- Alterar senha
- Billing info (plano atual, próximo pagamento)
- Danger zone: Cancelar subscription, Deletar conta

## API Client
```typescript
// src/lib/api.ts

const API_URL = import.meta.env.VITE_API_URL;

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  loadToken() {
    this.token = localStorage.getItem("token");
  }

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = "/auth/login";
      }
      const error = await response.json();
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(data: { email: string; password: string; name?: string }) {
    const result = await this.request<{ token: string; user: User }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async forgotPassword(email: string) {
    return this.request("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async getMe() {
    return this.request<User>("/api/v1/users/me");
  }

  async updateMe(data: Partial<User>) {
    return this.request<User>("/api/v1/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Sessions
  async getSessions(params?: SessionFilters) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<Session>>(`/api/v1/sessions?${query}`);
  }

  async getSession(id: string) {
    return this.request<SessionDetail>(`/api/v1/sessions/${id}`);
  }

  async deleteSession(id: string) {
    return this.request(`/api/v1/sessions/${id}`, { method: "DELETE" });
  }

  // Analytics
  async getExperienceHourly(sessionId: string) {
    return this.request<ExperienceHourly>(`/api/v1/analytics/experience/hourly?sessionId=${sessionId}`);
  }

  async getKillsByCreature(sessionId?: string) {
    const query = sessionId ? `?sessionId=${sessionId}` : "";
    return this.request<KillsByCreature[]>(`/api/v1/analytics/kills/by-creature${query}`);
  }

  async getLootSummary(sessionId?: string) {
    const query = sessionId ? `?sessionId=${sessionId}` : "";
    return this.request<LootSummary>(`/api/v1/analytics/loot/summary${query}`);
  }

  // API Keys
  async getApiKeys() {
    return this.request<ApiKey[]>("/api/v1/api-keys");
  }

  async createApiKey(name: string) {
    return this.request<{ key: string; apiKey: ApiKey }>("/api/v1/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async revokeApiKey(id: string) {
    return this.request(`/api/v1/api-keys/${id}`, { method: "DELETE" });
  }

  // Characters
  async getCharacters() {
    return this.request<CharacterWithStatus[]>("/api/v1/characters");
  }

  async createCharacter(data: { name: string; world: string; vocation?: string }) {
    return this.request<Character>("/api/v1/characters", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCharacter(id: string) {
    return this.request<Character>(`/api/v1/characters/${id}`);
  }

  async deleteCharacter(id: string) {
    return this.request(`/api/v1/characters/${id}`, { method: "DELETE" });
  }

  async getCharacterSessions(id: string, params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<Session>>(`/api/v1/characters/${id}/sessions?${query}`);
  }

  async getActiveCharacter() {
    return this.request<{ character: Character; session: Session } | null>("/api/v1/characters/active");
  }

  // Sessions
  async getActiveSession() {
    return this.request<Session | null>("/api/v1/sessions/active");
  }

  // License
  async getLicenseStatus() {
    return this.request<LicenseStatusResponse>("/api/v1/license/status");
  }

  // Subscription
  async getCurrentSubscription() {
    return this.request<Subscription>("/api/v1/subscriptions/current");
  }

  async cancelSubscription() {
    return this.request("/api/v1/subscriptions/cancel", { method: "POST" });
  }
}

export const api = new ApiClient();

// Additional Types
interface Character {
  id: string;
  name: string;
  world: string;
  level: number | null;
  vocation: string | null;
  createdAt: string;
}

interface CharacterWithStatus extends Character {
  hasActiveSession: boolean;
  activeSessionId: string | null;
}

interface LicenseStatusResponse {
  hasLicense: boolean;
  status: "active" | "expired" | "revoked" | null;
  expiresAt: string | null;
  daysRemaining: number;
  keys: Array<{
    id: string;
    name: string;
    keyPrefix: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  }>;
}

// Types
interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "user" | "admin";
  createdAt: string;
}

interface Session {
  id: string;
  characterName: string;
  huntLocation: string | null;
  status: "active" | "completed" | "crashed";
  startedAt: string;
  endedAt: string | null;
  stats: {
    totalKills: number;
    totalExperience: number;
    totalLootValue: number;
    xpPerHour: number;
  };
}

interface SessionDetail extends Session {
  kills: Kill[];
  loot: Loot[];
  experienceSnapshots: ExperienceSnapshot[];
}

interface Kill {
  id: string;
  creatureName: string;
  experienceGained: number | null;
  killedAt: string;
}

interface Loot {
  id: string;
  itemName: string;
  quantity: number;
  estimatedValue: number | null;
  lootedAt: string;
}

interface ExperienceSnapshot {
  experience: number;
  level: number;
  recordedAt: string;
}

interface ExperienceHourly {
  xpPerHourAverage: number;
  dataPoints: Array<{
    timestamp: string;
    xpPerHour: number;
    level: number;
  }>;
}

interface KillsByCreature {
  creatureName: string;
  totalKills: number;
  totalExperience: number;
}

interface LootSummary {
  items: Array<{
    itemName: string;
    totalQuantity: number;
    totalValue: number;
  }>;
  totalValue: number;
}

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface Subscription {
  id: string;
  planId: string;
  plan: {
    name: string;
    price: number;
  };
  status: "active" | "cancelled" | "past_due";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface SessionFilters {
  page?: number;
  limit?: number;
  characterName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Auth Store (Zustand)
```typescript
// src/stores/auth-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "user" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email, password) => {
        const { user } = await api.login(email, password);
        set({ user, isAuthenticated: true });
      },

      register: async (data) => {
        const { user } = await api.register(data);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        api.clearToken();
        set({ user: null, isAuthenticated: false });
      },

      loadUser: async () => {
        try {
          api.loadToken();
          const user = await api.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
```

## Hooks

### use-sessions.ts
```typescript
// src/hooks/use-sessions.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSessions(filters?: SessionFilters) {
  return useQuery({
    queryKey: ["sessions", filters],
    queryFn: () => api.getSessions(filters),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ["session", id],
    queryFn: () => api.getSession(id),
    enabled: !!id,
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
```

### use-analytics.ts
```typescript
// src/hooks/use-analytics.ts

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useExperienceHourly(sessionId: string) {
  return useQuery({
    queryKey: ["experience-hourly", sessionId],
    queryFn: () => api.getExperienceHourly(sessionId),
    enabled: !!sessionId,
    refetchInterval: 30000, // 30s
  });
}

export function useKillsByCreature(sessionId?: string) {
  return useQuery({
    queryKey: ["kills-by-creature", sessionId],
    queryFn: () => api.getKillsByCreature(sessionId),
  });
}

export function useLootSummary(sessionId?: string) {
  return useQuery({
    queryKey: ["loot-summary", sessionId],
    queryFn: () => api.getLootSummary(sessionId),
  });
}
```

### use-realtime.ts
```typescript
// src/hooks/use-realtime.ts

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Position {
  x: number;
  y: number;
  z: number;
}

export function useRealtimePosition(sessionId: string) {
  const [position, setPosition] = useState<Position | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io(import.meta.env.VITE_API_URL, {
      path: "/ws",
      query: { session: sessionId },
    });

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("position", (data: Position) => {
      setPosition(data);
    });

    return () => {
      socket.close();
    };
  }, [sessionId]);

  return { position, isConnected };
}
```

## Components

### Sidebar
```tsx
// src/components/layout/sidebar.tsx

import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Clock,
  TrendingUp,
  Map,
  Key,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Clock, label: "Sessions", href: "/dashboard/sessions" },
  { icon: TrendingUp, label: "Analytics", href: "/dashboard/analytics/experience" },
  { icon: Map, label: "Live Map", href: "/dashboard/live-map" },
  { icon: Key, label: "API Keys", href: "/dashboard/api-keys" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings/profile" },
];

export function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950 border-r border-slate-800">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
          <span className="text-xl font-bold text-white">TibiaEye</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href ||
              location.pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
```

### Stats Card
```tsx
// src/components/cards/stats-card.tsx

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-slate-800 bg-slate-900/50 p-6",
      className
    )}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <Icon className="h-5 w-5 text-slate-500" />
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend && (
          <span className={cn(
            "text-sm font-medium",
            trend.isPositive ? "text-emerald-400" : "text-red-400"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}
```

### XP Chart
```tsx
// src/components/charts/xp-chart.tsx

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface XPChartProps {
  data: Array<{
    timestamp: string;
    xpPerHour: number;
    level: number;
  }>;
  averageXpPerHour: number;
}

export function XPChart({ data, averageXpPerHour }: XPChartProps) {
  const formatXp = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Experience per Hour</CardTitle>
        <p className="text-2xl font-bold text-emerald-400">
          {formatXp(averageXpPerHour)} XP/h
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) => new Date(v).toLocaleTimeString()}
              stroke="#64748b"
              tick={{ fill: "#64748b" }}
            />
            <YAxis
              tickFormatter={formatXp}
              stroke="#64748b"
              tick={{ fill: "#64748b" }}
            />
            <Tooltip
              labelFormatter={(v) => new Date(v).toLocaleString()}
              formatter={(v: number) => [formatXp(v) + " XP/h", "XP/h"]}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Line
              type="monotone"
              dataKey="xpPerHour"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### License Status Card
```tsx
// src/components/cards/license-status-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Key, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LicenseStatusCardProps {
  hasLicense: boolean;
  status: "active" | "expired" | "revoked" | null;
  daysRemaining: number;
  expiresAt: string | null;
  onRenew: () => void;
}

export function LicenseStatusCard({
  hasLicense,
  status,
  daysRemaining,
  expiresAt,
  onRenew,
}: LicenseStatusCardProps) {
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;
  const progressValue = Math.min(100, (daysRemaining / 30) * 100);

  return (
    <Card className={cn(
      "bg-slate-900/50 border-slate-800",
      !hasLicense && "border-red-500/50",
      isExpiringSoon && "border-yellow-500/50"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Key className="h-5 w-5" />
          License Status
        </CardTitle>
        <Badge className={cn(
          status === "active" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          status === "expired" && "bg-red-500/10 text-red-400 border-red-500/20",
          status === "revoked" && "bg-slate-500/10 text-slate-400 border-slate-500/20",
          !hasLicense && "bg-red-500/10 text-red-400 border-red-500/20",
        )}>
          {status || "No License"}
        </Badge>
      </CardHeader>
      <CardContent>
        {hasLicense && status === "active" ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Days Remaining</span>
              <span className={cn(
                "text-2xl font-bold",
                daysRemaining > 7 ? "text-emerald-400" : "text-yellow-400"
              )}>
                {daysRemaining}
              </span>
            </div>
            <Progress value={progressValue} className="h-2 mb-4" />
            {isExpiringSoon && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm mb-4">
                <AlertTriangle className="h-4 w-4" />
                <span>Your license is expiring soon!</span>
              </div>
            )}
            <p className="text-xs text-slate-500">
              Expires: {expiresAt ? new Date(expiresAt).toLocaleDateString() : "N/A"}
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
            <p className="text-slate-400 mb-4">
              {status === "expired"
                ? "Your license has expired"
                : "You don't have an active license"}
            </p>
            <Button onClick={onRenew} className="bg-emerald-500 hover:bg-emerald-600 text-black">
              {status === "expired" ? "Renew License" : "Get License"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Active Session Banner
```tsx
// src/components/cards/active-session-banner.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Sword, Coins, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useRealtimePosition } from "@/hooks/use-realtime";
import { formatDuration, formatNumber } from "@/lib/utils";

interface ActiveSessionBannerProps {
  session: {
    id: string;
    characterName: string;
    huntLocation: string | null;
    startedAt: string;
    totalKills: number;
    totalExperience: number;
    totalLootValue: number;
  };
}

export function ActiveSessionBanner({ session }: ActiveSessionBannerProps) {
  const { position, isConnected } = useRealtimePosition(session.id);
  const duration = Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000);

  return (
    <Card className="bg-gradient-to-r from-emerald-950/50 to-slate-900/50 border-emerald-500/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Pulse indicator */}
            <div className="relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{session.characterName}</h3>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  ONLINE
                </Badge>
              </div>
              <p className="text-sm text-slate-400">
                {session.huntLocation || "Unknown location"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <Clock className="h-4 w-4 text-slate-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-white">{formatDuration(duration)}</p>
              <p className="text-xs text-slate-500">Duration</p>
            </div>
            <div className="text-center">
              <Sword className="h-4 w-4 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-white">{formatNumber(session.totalKills)}</p>
              <p className="text-xs text-slate-500">Kills</p>
            </div>
            <div className="text-center">
              <Activity className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-white">{formatNumber(session.totalExperience)}</p>
              <p className="text-xs text-slate-500">XP Gained</p>
            </div>
            <div className="text-center">
              <Coins className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-white">{formatNumber(session.totalLootValue)}</p>
              <p className="text-xs text-slate-500">Loot Value</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="border-slate-700">
              <Link to={`/dashboard/sessions/${session.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            <Button size="sm" asChild className="bg-emerald-500 hover:bg-emerald-600 text-black">
              <Link to="/dashboard/live-map">
                Live Map
              </Link>
            </Button>
          </div>
        </div>

        {/* Position info */}
        {position && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-sm text-slate-400">
            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
            <span>Position: {position.x}, {position.y}, {position.z}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Characters List
```tsx
// src/components/characters/characters-list.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash, History } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface Character {
  id: string;
  name: string;
  world: string;
  level: number | null;
  vocation: string | null;
  hasActiveSession: boolean;
  activeSessionId: string | null;
}

interface CharactersListProps {
  characters: Character[];
  onAddClick: () => void;
  onDelete: (id: string) => void;
}

export function CharactersList({ characters, onAddClick, onDelete }: CharactersListProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Your Characters</CardTitle>
        <Button onClick={onAddClick} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      </CardHeader>
      <CardContent>
        {characters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No characters added yet</p>
            <Button onClick={onAddClick} variant="outline" className="border-slate-700">
              Add your first character
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Character</TableHead>
                <TableHead className="text-slate-400">World</TableHead>
                <TableHead className="text-slate-400">Level</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {characters.map((char) => (
                <TableRow key={char.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{char.name}</p>
                      {char.vocation && (
                        <p className="text-sm text-slate-400">{char.vocation}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">{char.world}</TableCell>
                  <TableCell className="text-slate-300">{char.level || "-"}</TableCell>
                  <TableCell>
                    {char.hasActiveSession ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse">
                        ONLINE
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">
                        Offline
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link to={`/dashboard/characters/${char.id}`}>
                          <History className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => onDelete(char.id)}
                        disabled={char.hasActiveSession}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
```

### Add Character Dialog
```tsx
// src/components/characters/add-character-dialog.tsx

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WORLDS = [
  "Antica", "Secura", "Premia", "Gentebra", "Belobra",
  "Kalibra", "Lobera", "Pacera", "Solidera", "Venebra",
  // Add more worlds...
];

const VOCATIONS = [
  "Knight", "Elite Knight",
  "Paladin", "Royal Paladin",
  "Sorcerer", "Master Sorcerer",
  "Druid", "Elder Druid",
];

interface AddCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; world: string; vocation?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function AddCharacterDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: AddCharacterDialogProps) {
  const [name, setName] = useState("");
  const [world, setWorld] = useState("");
  const [vocation, setVocation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, world, vocation: vocation || undefined });
    setName("");
    setWorld("");
    setVocation("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Add Character</DialogTitle>
          <DialogDescription className="text-slate-400">
            Add a character to track with TibiaEye
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Character Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter character name"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="world" className="text-slate-300">World</Label>
              <Select value={world} onValueChange={setWorld} required>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select world" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {WORLDS.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vocation" className="text-slate-300">Vocation (optional)</Label>
              <Select value={vocation} onValueChange={setVocation}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select vocation" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {VOCATIONS.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name || !world}
              className="bg-emerald-500 hover:bg-emerald-600 text-black"
            >
              {isLoading ? "Adding..." : "Add Character"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Live Map
```tsx
// src/components/map/live-map.tsx

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimePosition } from "@/hooks/use-realtime";

interface LiveMapProps {
  sessionId: string;
}

const TIBIA_MAP = {
  minX: 31744,
  maxX: 34304,
  minY: 30976,
  maxY: 32768,
  tileUrl: "https://tibiamaps.io/map",
};

export function LiveMap({ sessionId }: LiveMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { position, isConnected } = useRealtimePosition(sessionId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !position) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw position indicator
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Pulse effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Main dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#10b981";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [position]);

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Live Position</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="text-sm text-slate-400">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        {position && (
          <p className="text-sm font-mono text-slate-400">
            {position.x}, {position.y}, {position.z}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full rounded-lg"
          />
          {!position && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-slate-500">Waiting for position data...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Design
- Sidebar fixa à esquerda com navegação
- Header com user menu e notificações
- Dark mode como padrão
- Cores: emerald para sucesso, red para erro
- Gradientes sutis nos cards

## package.json
```json
{
  "name": "@tibia/app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "biome check .",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-slot": "^1.0.2",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-router": "^1.15.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.7.4",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.5.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.2.0"
  }
}
```

## Entregáveis
1. Código completo de todos os arquivos
2. package.json com dependências
3. biome.json configurado
4. Testes básicos para hooks principais

## Não fazer
- Não implementar backend
- Não criar a API, apenas consumir
- Não usar emojis no código
