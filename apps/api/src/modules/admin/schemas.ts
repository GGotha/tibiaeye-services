import { z } from "zod";

// ─── Shared ──────────────────────────────────────────────────────────

export const UuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Users ───────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  name: z.string().nullable(),
  avatar: z.string().nullable(),
  role: z.enum(["user", "admin"]),
  status: z.enum(["active", "suspended", "banned"]),
  createdAt: z.string(),
  lastLoginAt: z.string().nullable(),
  subscriptionStatus: z.enum(["active", "cancelled", "past_due", "none"]),
  charactersCount: z.number(),
  sessionsCount: z.number(),
});

export const SessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  characterName: z.string(),
  huntLocation: z.string().nullable(),
  status: z.enum(["active", "completed", "crashed"]),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  stats: z.object({
    totalKills: z.number(),
    totalExperience: z.number(),
    totalLootValue: z.number(),
    xpPerHour: z.number(),
  }),
});

export const LicenseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userEmail: z.string(),
  userName: z.string().nullable(),
  keyPrefix: z.string(),
  status: z.enum(["active", "expired", "revoked"]),
  expiresAt: z.string(),
  createdAt: z.string(),
  lastUsedAt: z.string().nullable(),
  activationsCount: z.number(),
  maxActivations: z.number(),
});

export const ApiKeySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userEmail: z.string(),
  name: z.string(),
  keyPrefix: z.string(),
  status: z.enum(["active", "revoked"]),
  lastUsedAt: z.string().nullable(),
  createdAt: z.string(),
  requestsCount: z.number(),
});

export const PlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  interval: z.enum(["month", "year"]),
  features: z.array(z.string()),
  maxCharacters: z.number(),
  maxApiKeys: z.number(),
  isActive: z.boolean(),
  subscribersCount: z.number(),
});

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userEmail: z.string(),
  userName: z.string().nullable(),
  planId: z.string().uuid(),
  plan: PlanSchema,
  status: z.enum(["active", "cancelled", "past_due", "trialing"]),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  cancelAtPeriodEnd: z.boolean(),
  createdAt: z.string(),
});

export const UserDetailSchema = UserSchema.extend({
  subscription: SubscriptionSchema.nullable(),
  licenses: z.array(LicenseSchema),
  apiKeys: z.array(ApiKeySchema),
  recentSessions: z.array(SessionSchema),
});

export const PaginatedUsersResponseSchema = z.object({
  data: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const UserListQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.enum(["active", "suspended", "banned"]).optional(),
  subscriptionStatus: z.enum(["active", "cancelled", "past_due", "none"]).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const SuspendUserBodySchema = z.object({
  reason: z.string().optional(),
});

export const BanUserBodySchema = z.object({
  reason: z.string().optional(),
});

export const GivePlanSchema = z.object({
  planId: z.string().uuid(),
  durationDays: z.coerce.number().int().positive().default(30),
});

// ─── Subscriptions ───────────────────────────────────────────────────

export const PaginatedSubscriptionsSchema = z.object({
  data: z.array(SubscriptionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const SubscriptionListQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(["active", "cancelled", "past_due", "trialing"]).optional(),
  planId: z.string().uuid().optional(),
});

export const CancelSubscriptionBodySchema = z.object({
  immediate: z.boolean().default(false),
});

export const ExtendSubscriptionBodySchema = z.object({
  days: z.number().int().positive(),
});

// ─── Plans ───────────────────────────────────────────────────────────

export const CreatePlanBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.number().min(0),
  interval: z.enum(["month", "year"]).default("month"),
  features: z.array(z.string()).default([]),
  maxCharacters: z.number().int().positive().default(1),
  maxApiKeys: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
});

export const UpdatePlanBodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.number().min(0).optional(),
  interval: z.enum(["month", "year"]).optional(),
  features: z.array(z.string()).optional(),
  maxCharacters: z.number().int().positive().optional(),
  maxApiKeys: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

// ─── Licenses ────────────────────────────────────────────────────────

export const PaginatedLicensesSchema = z.object({
  data: z.array(LicenseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const LicenseListQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(["active", "expired", "revoked"]).optional(),
  search: z.string().optional(),
  expiringWithinDays: z.coerce.number().int().positive().optional(),
});

export const LicenseStatsSchema = z.object({
  total: z.number(),
  active: z.number(),
  expired: z.number(),
  revoked: z.number(),
  expiringThisWeek: z.number(),
});

export const RevokeLicenseBodySchema = z.object({
  reason: z.string().optional(),
});

export const ExtendLicenseBodySchema = z.object({
  days: z.number().int().positive(),
});

export const BulkExtendBodySchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  days: z.number().int().positive(),
});

export const BulkExtendResponseSchema = z.object({
  updated: z.number(),
});

// ─── API Keys ────────────────────────────────────────────────────────

export const PaginatedApiKeysSchema = z.object({
  data: z.array(ApiKeySchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const ApiKeyListQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(["active", "revoked"]).optional(),
});

// ─── Analytics ───────────────────────────────────────────────────────

export const FullPlatformStatsSchema = z.object({
  users: z.object({
    total: z.number(),
    activeToday: z.number(),
    newThisWeek: z.number(),
    newThisMonth: z.number(),
    growthRate: z.number(),
  }),
  subscriptions: z.object({
    total: z.number(),
    mrr: z.number(),
    mrrGrowth: z.number(),
    churnRate: z.number(),
    activeTrials: z.number(),
  }),
  licenses: z.object({
    total: z.number(),
    active: z.number(),
    expiringThisWeek: z.number(),
  }),
  usage: z.object({
    sessionsToday: z.number(),
    apiRequestsToday: z.number(),
    avgSessionDuration: z.number(),
    peakConcurrentBots: z.number(),
  }),
});

export const RevenueDataSchema = z.object({
  date: z.string(),
  mrr: z.number(),
  newSubscriptions: z.number(),
  churn: z.number(),
});

export const UsageDataSchema = z.object({
  date: z.string(),
  sessions: z.number(),
  apiRequests: z.number(),
  uniqueUsers: z.number(),
});

export const BotsOnlineSchema = z.object({
  count: z.number(),
  peak: z.number(),
});

export const AnalyticsPeriodQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
});

// ─── Settings ────────────────────────────────────────────────────────

export const FeatureFlagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  enabled: z.boolean(),
  updatedAt: z.string(),
});

export const SetFeatureFlagBodySchema = z.object({
  enabled: z.boolean(),
});

export const MaintenanceModeSchema = z.object({
  enabled: z.boolean(),
  message: z.string().nullable(),
  scheduledEnd: z.string().nullable(),
});

// ─── Legacy Exports (kept for type inference) ────────────────────────

export const MessageResponseSchema = z.object({
  message: z.string(),
});

// ─── Type Exports ────────────────────────────────────────────────────

export type UserListQuery = z.infer<typeof UserListQuerySchema>;
export type GivePlanInput = z.infer<typeof GivePlanSchema>;
export type PlatformStats = z.infer<typeof FullPlatformStatsSchema>;
export type AdminUser = z.infer<typeof UserSchema>;
export type AdminUserDetail = z.infer<typeof UserDetailSchema>;
