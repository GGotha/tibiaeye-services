import { z } from "zod";

export const PlatformStatsSchema = z.object({
  totalUsers: z.number(),
  activeSubscriptions: z.number(),
  totalSessions: z.number(),
  activeSessions: z.number(),
  totalCharacters: z.number(),
  recentSignups: z.number(), // Last 7 days
});

export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: z.enum(["user", "admin"]),
  status: z.enum(["active", "suspended", "banned"]),
  createdAt: z.string().datetime(),
  subscription: z
    .object({
      id: z.string().uuid(),
      planName: z.string(),
      status: z.enum(["active", "cancelled", "past_due", "trialing"]),
      currentPeriodEnd: z.string().datetime(),
    })
    .nullable(),
  charactersCount: z.number(),
  sessionsCount: z.number(),
});

export const AdminUserListSchema = z.array(AdminUserSchema);

export const UserListQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["active", "suspended", "banned"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const GivePlanSchema = z.object({
  planId: z.string().uuid(),
  durationDays: z.number().int().positive().default(30),
});

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export type PlatformStats = z.infer<typeof PlatformStatsSchema>;
export type AdminUser = z.infer<typeof AdminUserSchema>;
export type UserListQuery = z.infer<typeof UserListQuerySchema>;
export type GivePlanInput = z.infer<typeof GivePlanSchema>;
