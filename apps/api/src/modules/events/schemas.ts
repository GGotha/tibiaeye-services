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

export const AttackStartEventSchema = z.object({
  type: z.literal("attack_start"),
  creatureName: z.string(),
  positionX: z.number().int().optional(),
  positionY: z.number().int().optional(),
  positionZ: z.number().int().optional(),
  timestamp: z.string().datetime().optional(),
});

export const WaypointReachedEventSchema = z.object({
  type: z.literal("waypoint_reached"),
  waypointIndex: z.number().int(),
  waypointType: z.string().optional(),
  positionX: z.number().int().optional(),
  positionY: z.number().int().optional(),
  positionZ: z.number().int().optional(),
  timestamp: z.string().datetime().optional(),
});

export const WarningEventSchema = z.object({
  type: z.literal("warning"),
  message: z.string(),
  level: z.enum(["warning", "error"]).default("warning"),
  positionX: z.number().int().optional(),
  positionY: z.number().int().optional(),
  positionZ: z.number().int().optional(),
  timestamp: z.string().datetime().optional(),
});

export const HealEventSchema = z.object({
  type: z.literal("heal"),
  healType: z.string(),
  hotkey: z.string().optional(),
  potionType: z.string().optional(),
  hpPercent: z.number().optional(),
  manaPercent: z.number().optional(),
  timestamp: z.string().datetime().optional(),
});

export const PauseEventSchema = z.object({
  type: z.literal("pause"),
  timestamp: z.string().datetime().optional(),
});

export const ResumeEventSchema = z.object({
  type: z.literal("resume"),
  timestamp: z.string().datetime().optional(),
});

export const DisconnectEventSchema = z.object({
  type: z.literal("disconnect"),
  reason: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export const ReconnectRetryEventSchema = z.object({
  type: z.literal("reconnect_retry"),
  retryCount: z.number().int().optional(),
  reason: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export const ReconnectSuccessEventSchema = z.object({
  type: z.literal("reconnect_success"),
  retryCount: z.number().int().optional(),
  durationSeconds: z.number().optional(),
  timestamp: z.string().datetime().optional(),
});

export const ReconnectFailureEventSchema = z.object({
  type: z.literal("reconnect_failure"),
  retryCount: z.number().int().optional(),
  reason: z.string().optional(),
  durationSeconds: z.number().optional(),
  timestamp: z.string().datetime().optional(),
});

export const EventSchema = z.discriminatedUnion("type", [
  KillEventSchema,
  LootEventSchema,
  ExperienceSnapshotEventSchema,
  DeathEventSchema,
  LevelUpEventSchema,
  RefillEventSchema,
  AttackStartEventSchema,
  WaypointReachedEventSchema,
  WarningEventSchema,
  HealEventSchema,
  PauseEventSchema,
  ResumeEventSchema,
  DisconnectEventSchema,
  ReconnectRetryEventSchema,
  ReconnectSuccessEventSchema,
  ReconnectFailureEventSchema,
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
export type AttackStartEvent = z.infer<typeof AttackStartEventSchema>;
export type WaypointReachedEvent = z.infer<typeof WaypointReachedEventSchema>;
export type WarningEvent = z.infer<typeof WarningEventSchema>;
export type HealEvent = z.infer<typeof HealEventSchema>;
export type PauseEvent = z.infer<typeof PauseEventSchema>;
export type ResumeEvent = z.infer<typeof ResumeEventSchema>;
export type DisconnectEvent = z.infer<typeof DisconnectEventSchema>;
export type ReconnectRetryEvent = z.infer<typeof ReconnectRetryEventSchema>;
export type ReconnectSuccessEvent = z.infer<typeof ReconnectSuccessEventSchema>;
export type ReconnectFailureEvent = z.infer<typeof ReconnectFailureEventSchema>;
export type Event = z.infer<typeof EventSchema>;
export type BatchEventsInput = z.infer<typeof BatchEventsSchema>;
export type BatchResult = z.infer<typeof BatchResultSchema>;
