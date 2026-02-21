import { z } from "zod";

export const KillEventSchema = z.object({
  type: z.literal("kill"),
  creatureName: z.string(),
  experienceGained: z.number().int().optional(),
  positionX: z.number().int().optional(),
  positionY: z.number().int().optional(),
  positionZ: z.number().int().optional(),
  timestamp: z.string().datetime().optional(),
});

export const LootEventSchema = z.object({
  type: z.literal("loot"),
  itemName: z.string(),
  quantity: z.number().int().positive().default(1),
  estimatedValue: z.number().int().optional(),
  timestamp: z.string().datetime().optional(),
});

export const ExperienceSnapshotEventSchema = z.object({
  type: z.literal("experience"),
  experience: z.string(), // bigint as string
  level: z.number().int().positive(),
  timestamp: z.string().datetime().optional(),
});

export const DeathEventSchema = z.object({
  type: z.literal("death"),
  killer: z.string().optional(),
  positionX: z.number().int().optional(),
  positionY: z.number().int().optional(),
  positionZ: z.number().int().optional(),
  timestamp: z.string().datetime().optional(),
});

export const LevelUpEventSchema = z.object({
  type: z.literal("level_up"),
  newLevel: z.number().int().positive(),
  timestamp: z.string().datetime().optional(),
});

export const RefillEventSchema = z.object({
  type: z.literal("refill"),
  potionsBought: z.number().int().optional(),
  goldSpent: z.number().int().optional(),
  timestamp: z.string().datetime().optional(),
});

export const EventSchema = z.discriminatedUnion("type", [
  KillEventSchema,
  LootEventSchema,
  ExperienceSnapshotEventSchema,
  DeathEventSchema,
  LevelUpEventSchema,
  RefillEventSchema,
]);

export const BatchEventsSchema = z.object({
  sessionId: z.string().uuid(),
  events: z.array(EventSchema).min(1).max(1000),
});

export const BatchResultSchema = z.object({
  processed: z.number(),
  errors: z.number(),
});

export type KillEvent = z.infer<typeof KillEventSchema>;
export type LootEvent = z.infer<typeof LootEventSchema>;
export type ExperienceSnapshotEvent = z.infer<typeof ExperienceSnapshotEventSchema>;
export type DeathEvent = z.infer<typeof DeathEventSchema>;
export type LevelUpEvent = z.infer<typeof LevelUpEventSchema>;
export type RefillEvent = z.infer<typeof RefillEventSchema>;
export type Event = z.infer<typeof EventSchema>;
export type BatchEventsInput = z.infer<typeof BatchEventsSchema>;
export type BatchResult = z.infer<typeof BatchResultSchema>;
