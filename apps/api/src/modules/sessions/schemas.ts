import { z } from "zod";

export const CreateSessionSchema = z.object({
  characterId: z.string().uuid(),
  huntLocation: z.string().optional(),
  initialLevel: z.number().int().positive().optional(),
  initialExperience: z.string().optional(), // bigint as string
  routeId: z.string().uuid().optional(),
});

export const UpdateSessionSchema = z.object({
  status: z.enum(["active", "paused", "completed", "crashed"]).optional(),
  huntLocation: z.string().optional(),
  finalLevel: z.number().int().positive().optional(),
  finalExperience: z.string().optional(), // bigint as string
  totalKills: z.number().int().nonnegative().optional(),
  totalExperience: z.string().optional(), // bigint as string
  totalLootValue: z.number().int().nonnegative().optional(),
});

export const SessionSchema = z.object({
  id: z.string().uuid(),
  characterId: z.string().uuid(),
  characterName: z.string(),
  huntLocation: z.string().nullable(),
  status: z.enum(["active", "paused", "completed", "crashed"]),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  initialLevel: z.number().nullable(),
  initialExperience: z.string().nullable(),
  finalLevel: z.number().nullable(),
  finalExperience: z.string().nullable(),
  totalKills: z.number(),
  totalExperience: z.string(),
  totalLootValue: z.number(),
  duration: z.number(), // in seconds
  xpPerHour: z.number(),
});

export const PaginatedSessionListSchema = z.object({
  data: z.array(SessionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const SessionQuerySchema = z.object({
  characterId: z.string().uuid().optional(),
  status: z.enum(["active", "paused", "completed", "crashed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export const PositionLogSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  recordedAt: z.string().datetime(),
});

export const PositionLogListSchema = z.array(PositionLogSchema);

export const PositionLogQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50000).default(10000),
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionInput = z.infer<typeof UpdateSessionSchema>;
export type SessionOutput = z.infer<typeof SessionSchema>;
export type SessionQuery = z.infer<typeof SessionQuerySchema>;
