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
  data: Record<string, unknown>;
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
