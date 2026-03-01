export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "admin";
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "user" | "admin";
  status: "active" | "suspended" | "banned";
  createdAt: string;
  lastLoginAt: string | null;
  subscriptionStatus: "active" | "cancelled" | "past_due" | "none";
  charactersCount: number;
  sessionsCount: number;
}

export interface UserDetail extends User {
  subscription: Subscription | null;
  licenses: License[];
  apiKeys: ApiKey[];
  recentSessions: Session[];
}

export interface License {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  keyPrefix: string;
  status: "active" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string | null;
  activationsCount: number;
  maxActivations: number;
}

export interface LicenseStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  expiringThisWeek: number;
}

export interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  planId: string;
  plan: Plan;
  status: "active" | "cancelled" | "past_due" | "trialing";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: "month" | "year";
  features: string[];
  maxCharacters: number;
  maxApiKeys: number;
  isActive: boolean;
  subscribersCount: number;
}

export interface ApiKey {
  id: string;
  userId: string;
  userEmail: string;
  name: string;
  keyPrefix: string;
  status: "active" | "revoked";
  lastUsedAt: string | null;
  createdAt: string;
  requestsCount: number;
}

export interface Session {
  id: string;
  userId: string;
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

export interface PlatformStats {
  users: {
    total: number;
    activeToday: number;
    newThisWeek: number;
    newThisMonth: number;
    growthRate: number;
  };
  subscriptions: {
    total: number;
    mrr: number;
    mrrGrowth: number;
    churnRate: number;
    activeTrials: number;
  };
  licenses: {
    total: number;
    active: number;
    expiringThisWeek: number;
  };
  usage: {
    sessionsToday: number;
    apiRequestsToday: number;
    avgSessionDuration: number;
    peakConcurrentBots: number;
  };
}

export interface RevenueData {
  date: string;
  mrr: number;
  newSubscriptions: number;
  churn: number;
}

export interface UsageData {
  date: string;
  sessions: number;
  apiRequests: number;
  uniqueUsers: number;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  updatedAt: string;
}

export interface MaintenanceMode {
  enabled: boolean;
  message: string | null;
  scheduledEnd: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  subscriptionStatus?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SubscriptionFilters {
  page?: number;
  limit?: number;
  status?: string;
  planId?: string;
}

export interface LicenseFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  expiringWithinDays?: number;
}

export interface ApiKeyFilters {
  page?: number;
  limit?: number;
  status?: string;
}
