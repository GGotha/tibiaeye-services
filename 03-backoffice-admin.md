# Tarefa: Criar Backoffice Admin para TibiaEye

## Contexto
Painel administrativo para gerenciar usuários, subscriptions, API keys e analytics da plataforma.
Apenas admins têm acesso.

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
- Biome (linting/formatting)
- Vitest (testes)
- **Icons**: lucide-react (preferido) ou @phosphor-icons/react

## Estrutura de Arquivos
```
apps/backoffice/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── auth/login.tsx
│   │   └── dashboard/
│   │       ├── index.tsx          # Overview admin
│   │       ├── users/
│   │       │   ├── index.tsx
│   │       │   └── [id].tsx
│   │       ├── subscriptions/
│   │       │   ├── index.tsx
│   │       │   ├── plans.tsx
│   │       │   └── revenue.tsx
│   │       ├── api-keys/
│   │       │   └── index.tsx
│   │       ├── analytics/
│   │       │   ├── usage.tsx
│   │       │   ├── bots-online.tsx
│   │       │   └── performance.tsx
│   │       └── settings/
│   │           ├── pricing.tsx
│   │           └── features.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── charts/
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── users-chart.tsx
│   │   │   ├── usage-chart.tsx
│   │   │   └── realtime-bots.tsx
│   │   ├── tables/
│   │   │   ├── users-table.tsx
│   │   │   ├── subscriptions-table.tsx
│   │   │   └── api-keys-table.tsx
│   │   ├── cards/
│   │   │   ├── metric-card.tsx
│   │   │   └── revenue-card.tsx
│   │   └── layout/
│   │       ├── admin-sidebar.tsx
│   │       └── admin-header.tsx
│   ├── hooks/
│   │   ├── use-admin-auth.ts
│   │   ├── use-users.ts
│   │   ├── use-subscriptions.ts
│   │   └── use-platform-analytics.ts
│   ├── lib/
│   │   └── admin-api.ts
│   ├── stores/
│   │   └── admin-store.ts
│   └── types/
│       └── index.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── biome.json
└── index.html
```

## Proteção Admin-Only

O Backoffice DEVE verificar que o usuário é admin:

```typescript
// No login, verificar role
if (data.user.role !== "admin") {
  throw new Error("Access denied. Admin privileges required.");
}

// Em cada request, o backend deve verificar @Roles("admin")
```

## Funcionalidades por Página

### Dashboard Overview
- **Real-time Stats Cards**:
  - Total Users (com trend vs mês anterior)
  - Active Subscriptions
  - MRR (Monthly Recurring Revenue)
  - Bots Online NOW (atualiza a cada 5s)
- **Activity Feed**: Últimos eventos (new user, new subscription, etc)
- Gráfico de novos usuários (últimos 30 dias)
- Gráfico de revenue (últimos 12 meses)
- Quick links: Users, Subscriptions, Bots Online

### Users
- Tabela com TODOS os usuários
- **Expandable rows** para mostrar:
  - Characters do usuário
  - Status de cada character (online/offline)
  - License status
- Filtros: plano, status (active, suspended, banned), has_license
- Busca por email/nome/character
- Badge de role (USER/ADMIN)
- Actions: ver, suspender, deletar, impersonar

### User Detail [id]
- **Header**: Avatar, nome, email, role badge, status
- **Tabs**:
  - **Overview**: Info básica, subscription, license status
  - **Characters**: Lista de characters com stats
  - **Sessions**: Histórico de sessões (todas)
  - **Licenses**: Histórico de API keys
  - **Activity**: Log de atividades
- **Actions sidebar**:
  - Change role (user/admin)
  - Give free days
  - Suspend/Unsuspend
  - Generate new license key
  - Impersonate
  - Send email

### Subscriptions
- Tabela com todas as subscriptions
- Mostra: usuário, plano, status, próximo billing, MRR
- Filtros: plano, status
- Métricas no header: MRR total, churn rate, LTV médio
- Actions: Estender, Cancelar, Upgrade/Downgrade

### Licenses (NOVO - View dedicada)
- **Overview cards**:
  - Total Active Licenses
  - Expiring This Week
  - Expired (last 30 days)
  - Revenue from renewals
- Tabela de TODAS as licenses:
  - User (email)
  - Key prefix (tm_xxxx)
  - Status (active/expired/revoked)
  - Days remaining
  - Last used
  - Total requests
- Filtros: status, expiring soon, never used
- Actions: Revoke, Extend, Generate new for user
- **Bulk actions**: Extend all expiring

### Revenue Analytics
- Gráfico de MRR over time
- Breakdown por plano
- Churn analysis
- Cohort analysis
- Revenue forecast

### Plans Management
- Lista de planos com subscriber count
- Editar preços e limites
- Features list (checkmarks)
- Criar novo plano
- Desativar plano (migra users para outro)

### Bots Online (Real-time)
- **Live counter** com pulse animation
- Lista de sessões ativas:
  - User email
  - Character name
  - World
  - Hunt location
  - Duration
  - XP/h
- Mapa overview (quantos por região)
- Gráfico: bots online nas últimas 24h

### Platform Analytics
- Requests por endpoint (top 10)
- Latência média
- Error rate
- Uptime
- Peak hours

### Settings
- **Feature Flags**: Toggle switches para features
- **Maintenance Mode**: Banner + disable signups
- **Rate Limits**: Configurar por plano
- **System Health**: Status dos serviços

## Admin API Client
```typescript
// src/lib/admin-api.ts

const API_URL = import.meta.env.VITE_API_URL;

class AdminApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("admin_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("admin_token");
  }

  loadToken() {
    this.token = localStorage.getItem("admin_token");
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
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
      if (response.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      }
      const error = await response.json();
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: AdminUser }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.user.role !== "admin") {
      throw new Error("Access denied. Admin privileges required.");
    }

    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request<AdminUser>("/api/v1/users/me");
  }

  // Users
  async getUsers(params?: UserFilters): Promise<PaginatedResponse<User>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/admin/users?${query}`);
  }

  async getUser(id: string): Promise<UserDetail> {
    return this.request(`/api/v1/admin/users/${id}`);
  }

  async suspendUser(id: string): Promise<void> {
    return this.request(`/api/v1/admin/users/${id}/suspend`, { method: "PATCH" });
  }

  async unsuspendUser(id: string): Promise<void> {
    return this.request(`/api/v1/admin/users/${id}/unsuspend`, { method: "PATCH" });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/api/v1/admin/users/${id}`, { method: "DELETE" });
  }

  async impersonateUser(id: string): Promise<{ token: string }> {
    return this.request(`/api/v1/admin/users/${id}/impersonate`, { method: "POST" });
  }

  async giveFreePlan(userId: string, planId: string, days: number): Promise<void> {
    return this.request(`/api/v1/admin/users/${userId}/give-plan`, {
      method: "POST",
      body: JSON.stringify({ planId, days }),
    });
  }

  async changeUserRole(userId: string, role: "user" | "admin"): Promise<void> {
    return this.request(`/api/v1/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  async getUserCharacters(userId: string): Promise<Character[]> {
    return this.request(`/api/v1/admin/users/${userId}/characters`);
  }

  async getUserLicenses(userId: string): Promise<License[]> {
    return this.request(`/api/v1/admin/users/${userId}/licenses`);
  }

  async generateLicenseForUser(userId: string, days: number = 30): Promise<{ key: string; license: License }> {
    return this.request(`/api/v1/admin/users/${userId}/generate-license`, {
      method: "POST",
      body: JSON.stringify({ days }),
    });
  }

  // Licenses
  async getAllLicenses(params?: LicenseFilters): Promise<PaginatedResponse<LicenseWithUser>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/admin/licenses?${query}`);
  }

  async getLicenseStats(): Promise<LicenseStats> {
    return this.request("/api/v1/admin/licenses/stats");
  }

  async extendLicense(licenseId: string, days: number): Promise<License> {
    return this.request(`/api/v1/admin/licenses/${licenseId}/extend`, {
      method: "PATCH",
      body: JSON.stringify({ days }),
    });
  }

  async revokeLicense(licenseId: string): Promise<void> {
    return this.request(`/api/v1/admin/licenses/${licenseId}/revoke`, { method: "PATCH" });
  }

  async bulkExtendLicenses(licenseIds: string[], days: number): Promise<void> {
    return this.request("/api/v1/admin/licenses/bulk-extend", {
      method: "POST",
      body: JSON.stringify({ licenseIds, days }),
    });
  }

  // Subscriptions
  async getSubscriptions(params?: SubscriptionFilters): Promise<PaginatedResponse<Subscription>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/admin/subscriptions?${query}`);
  }

  async cancelSubscription(id: string): Promise<void> {
    return this.request(`/api/v1/admin/subscriptions/${id}/cancel`, { method: "PATCH" });
  }

  async extendSubscription(id: string, days: number): Promise<void> {
    return this.request(`/api/v1/admin/subscriptions/${id}/extend`, {
      method: "PATCH",
      body: JSON.stringify({ days }),
    });
  }

  // Plans
  async getPlans(): Promise<Plan[]> {
    return this.request("/api/v1/admin/plans");
  }

  async createPlan(data: CreatePlanData): Promise<Plan> {
    return this.request("/api/v1/admin/plans", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePlan(id: string, data: UpdatePlanData): Promise<Plan> {
    return this.request(`/api/v1/admin/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deactivatePlan(id: string): Promise<void> {
    return this.request(`/api/v1/admin/plans/${id}/deactivate`, { method: "PATCH" });
  }

  // API Keys (Global)
  async getAllApiKeys(params?: ApiKeyFilters): Promise<PaginatedResponse<ApiKeyWithUser>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/admin/api-keys?${query}`);
  }

  async revokeApiKey(id: string): Promise<void> {
    return this.request(`/api/v1/admin/api-keys/${id}`, { method: "DELETE" });
  }

  // Analytics
  async getPlatformStats(): Promise<PlatformStats> {
    return this.request("/api/v1/admin/analytics/platform");
  }

  async getUsageMetrics(period: string): Promise<UsageMetrics[]> {
    return this.request(`/api/v1/admin/analytics/usage?period=${period}`);
  }

  async getRevenueMetrics(period: string): Promise<RevenueMetrics[]> {
    return this.request(`/api/v1/admin/analytics/revenue?period=${period}`);
  }

  async getActiveBotsCount(): Promise<{ count: number; sessions: ActiveSession[] }> {
    return this.request("/api/v1/admin/analytics/bots-online");
  }

  async getEndpointStats(): Promise<EndpointStats[]> {
    return this.request("/api/v1/admin/analytics/endpoints");
  }

  // Settings
  async getFeatureFlags(): Promise<FeatureFlags> {
    return this.request("/api/v1/admin/settings/feature-flags");
  }

  async updateFeatureFlags(flags: Partial<FeatureFlags>): Promise<FeatureFlags> {
    return this.request("/api/v1/admin/settings/feature-flags", {
      method: "PATCH",
      body: JSON.stringify(flags),
    });
  }

  async setMaintenanceMode(enabled: boolean): Promise<void> {
    return this.request("/api/v1/admin/settings/maintenance", {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    });
  }
}

export const adminApi = new AdminApiClient();

// Types
interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: "admin";
}

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "user" | "admin";
  status: "active" | "suspended" | "banned";
  createdAt: string;
  subscription: {
    planName: string;
    status: string;
  } | null;
}

interface UserDetail extends User {
  apiKeys: ApiKey[];
  sessions: Session[];
  subscription: SubscriptionDetail | null;
}

interface Subscription {
  id: string;
  userId: string;
  user: {
    email: string;
    name: string | null;
  };
  planId: string;
  plan: {
    name: string;
    priceMonthly: number;
  };
  status: "active" | "cancelled" | "past_due" | "trialing";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

interface SubscriptionDetail extends Subscription {
  payments: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  status: "succeeded" | "failed" | "pending";
  createdAt: string;
}

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxCharacters: number;
  historyDays: number;
  apiRequestsPerDay: number;
  features: string[];
  isActive: boolean;
  subscriberCount: number;
}

interface CreatePlanData {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxCharacters: number;
  historyDays: number;
  apiRequestsPerDay: number;
  features: string[];
}

interface UpdatePlanData extends Partial<CreatePlanData> {}

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface ApiKeyWithUser extends ApiKey {
  userId: string;
  user: {
    email: string;
    name: string | null;
  };
  requestCount: number;
}

interface Session {
  id: string;
  characterName: string;
  status: "active" | "completed" | "crashed";
  startedAt: string;
  endedAt: string | null;
}

interface ActiveSession extends Session {
  userId: string;
  user: {
    email: string;
  };
  position?: {
    x: number;
    y: number;
    z: number;
  };
}

interface PlatformStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  botsOnlineNow: number;
  sessionsToday: number;
  newUsersToday: number;
  churnRate: number;
}

interface UsageMetrics {
  date: string;
  apiRequests: number;
  activeSessions: number;
  newUsers: number;
  activeUsers: number;
}

interface RevenueMetrics {
  date: string;
  revenue: number;
  newSubscriptions: number;
  cancellations: number;
  mrr: number;
}

interface EndpointStats {
  endpoint: string;
  method: string;
  totalRequests: number;
  avgLatency: number;
  errorRate: number;
}

interface FeatureFlags {
  maintenanceMode: boolean;
  signupsEnabled: boolean;
  newPricingEnabled: boolean;
  betaFeaturesEnabled: boolean;
}

interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
}

interface SubscriptionFilters {
  page?: number;
  limit?: number;
  planId?: string;
  status?: string;
}

interface ApiKeyFilters {
  page?: number;
  limit?: number;
  userId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Character types
interface Character {
  id: string;
  name: string;
  world: string;
  level: number | null;
  vocation: string | null;
  hasActiveSession: boolean;
}

// License types
interface License {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  status: "active" | "expired" | "revoked";
  expiresAt: string;
  lastUsedAt: string | null;
  totalRequests: number;
  createdAt: string;
}

interface LicenseWithUser extends License {
  user: {
    email: string;
    name: string | null;
  };
  daysRemaining: number;
}

interface LicenseStats {
  totalActive: number;
  expiringThisWeek: number;
  expiredLastMonth: number;
  neverUsed: number;
}

interface LicenseFilters {
  page?: number;
  limit?: number;
  status?: string;
  expiringDays?: number;
  userId?: string;
}
```

## Hooks

### use-users.ts
```typescript
// src/hooks/use-users.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => adminApi.getUsers(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useImpersonateUser() {
  return useMutation({
    mutationFn: (id: string) => adminApi.impersonateUser(id),
  });
}
```

### use-platform-analytics.ts
```typescript
// src/hooks/use-platform-analytics.ts

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => adminApi.getPlatformStats(),
    refetchInterval: 30000, // 30s
  });
}

export function useUsageMetrics(period: string) {
  return useQuery({
    queryKey: ["usage-metrics", period],
    queryFn: () => adminApi.getUsageMetrics(period),
  });
}

export function useRevenueMetrics(period: string) {
  return useQuery({
    queryKey: ["revenue-metrics", period],
    queryFn: () => adminApi.getRevenueMetrics(period),
  });
}

export function useActiveBotsCount() {
  return useQuery({
    queryKey: ["active-bots"],
    queryFn: () => adminApi.getActiveBotsCount(),
    refetchInterval: 5000, // 5s
  });
}

export function useEndpointStats() {
  return useQuery({
    queryKey: ["endpoint-stats"],
    queryFn: () => adminApi.getEndpointStats(),
  });
}
```

## Components

### Admin Sidebar
```tsx
// src/components/layout/admin-sidebar.tsx

import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Key,
  BarChart3,
  Activity,
  Settings,
  LogOut,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin-store";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Users", href: "/dashboard/users" },
  { icon: CreditCard, label: "Subscriptions", href: "/dashboard/subscriptions" },
  { icon: DollarSign, label: "Revenue", href: "/dashboard/subscriptions/revenue" },
  { icon: Key, label: "API Keys", href: "/dashboard/api-keys" },
  { icon: BarChart3, label: "Usage", href: "/dashboard/analytics/usage" },
  { icon: Activity, label: "Bots Online", href: "/dashboard/analytics/bots-online" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings/pricing" },
];

export function AdminSidebar() {
  const location = useLocation();
  const logout = useAdminStore((s) => s.logout);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950 border-r border-slate-800">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-orange-400" />
          <span className="text-xl font-bold text-white">Admin</span>
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
                    ? "bg-red-500/10 text-red-400"
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

### Metric Card
```tsx
// src/components/cards/metric-card.tsx

import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-slate-500",
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>

      <p className="mt-2 text-3xl font-bold text-white">{value}</p>

      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-400" />
          )}
          <span className={cn(
            "text-sm font-medium",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}>
            {isPositive ? "+" : ""}{change}%
          </span>
          {changeLabel && (
            <span className="text-sm text-slate-500">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
```

### Users Table
```tsx
// src/components/tables/users-table.tsx

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Ban, Trash, UserCog } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string | null;
  status: "active" | "suspended" | "banned";
  createdAt: string;
  subscription: {
    planName: string;
    status: string;
  } | null;
}

interface UsersTableProps {
  users: User[];
  onSuspend: (id: string) => void;
  onDelete: (id: string) => void;
  onImpersonate: (id: string) => void;
}

const statusColors = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  suspended: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  banned: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function UsersTable({ users, onSuspend, onDelete, onImpersonate }: UsersTableProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">User</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-slate-400">Plan</TableHead>
            <TableHead className="text-slate-400">Joined</TableHead>
            <TableHead className="text-slate-400 w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
              <TableCell>
                <div>
                  <p className="font-medium text-white">{user.name || "No name"}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={cn("border", statusColors[user.status])}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                {user.subscription ? (
                  <span className="text-slate-300">{user.subscription.planName}</span>
                ) : (
                  <span className="text-slate-500">Free</span>
                )}
              </TableCell>
              <TableCell className="text-slate-400">
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                    <DropdownMenuItem asChild>
                      <Link to={`/dashboard/users/${user.id}`} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onImpersonate(user.id)} className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      Impersonate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSuspend(user.id)} className="flex items-center gap-2 text-yellow-400">
                      <Ban className="h-4 w-4" />
                      Suspend
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(user.id)} className="flex items-center gap-2 text-red-400">
                      <Trash className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Revenue Chart
```tsx
// src/components/charts/revenue-chart.tsx

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    mrr: number;
  }>;
  totalRevenue: number;
}

export function RevenueChart({ data, totalRevenue }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Monthly Revenue</CardTitle>
        <p className="text-2xl font-bold text-emerald-400">
          {formatCurrency(totalRevenue)}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => new Date(v).toLocaleDateString("pt-BR", { month: "short" })}
              stroke="#64748b"
              tick={{ fill: "#64748b" }}
            />
            <YAxis
              tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
              stroke="#64748b"
              tick={{ fill: "#64748b" }}
            />
            <Tooltip
              formatter={(v: number) => [formatCurrency(v), "Revenue"]}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Realtime Bots Widget
```tsx
// src/components/charts/realtime-bots.tsx

import { useActiveBotsCount } from "@/hooks/use-platform-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function RealtimeBotsWidget() {
  const { data, isLoading } = useActiveBotsCount();

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Bots Online</CardTitle>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="text-sm text-slate-400">Live</span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse h-20 bg-slate-800 rounded" />
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Activity className="h-10 w-10 text-emerald-500" />
              <div>
                <p className="text-4xl font-bold text-white">{data?.count ?? 0}</p>
                <p className="text-sm text-slate-400">active sessions</p>
              </div>
            </div>

            {data?.sessions && data.sessions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-400">Recent sessions</p>
                {data.sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{session.characterName}</span>
                    <span className="text-slate-500">{session.user.email}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

## Design
- Sidebar com cores diferentes do App (vermelho/laranja para admin)
- Badges de status coloridos
- Tabelas com sorting e filtering
- Modais de confirmação para actions destrutivas
- Toast notifications para feedback

## package.json
```json
{
  "name": "@tibia/backoffice",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3002",
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
