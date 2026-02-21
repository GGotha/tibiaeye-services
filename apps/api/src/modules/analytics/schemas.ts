import { z } from "zod";

export const AnalyticsQuerySchema = z.object({
  sessionId: z.string().uuid().optional(),
  characterId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const ExperienceHourlySchema = z.object({
  hour: z.string(),
  experience: z.number(),
  xpPerHour: z.number(),
});

export const ExperienceHourlyListSchema = z.array(ExperienceHourlySchema);

export const KillsByCreatureSchema = z.object({
  creatureName: z.string(),
  totalKills: z.number(),
  totalExperience: z.number(),
});

export const KillsByCreatureListSchema = z.array(KillsByCreatureSchema);

export const LootItemSchema = z.object({
  itemName: z.string(),
  quantity: z.number(),
  totalValue: z.number(),
});

export const LootSummarySchema = z.object({
  items: z.array(LootItemSchema),
  totalValue: z.number(),
  totalItems: z.number(),
});

export const GameEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
});

export const GameEventListSchema = z.array(GameEventSchema);

export const ProfitQuerySchema = z.object({
  sessionId: z.string().uuid().optional(),
  characterId: z.string().uuid().optional(),
  days: z.coerce.number().int().min(1).max(90).default(7),
});

export const ProfitDataSchema = z.object({
  totalRevenue: z.number(),
  totalCost: z.number(),
  netProfit: z.number(),
  profitPerHour: z.number(),
  sessions: z.array(z.object({
    sessionId: z.string(),
    huntLocation: z.string().nullable(),
    duration: z.number(),
    lootValue: z.number(),
    suppliesCost: z.number(),
    netProfit: z.number(),
    startedAt: z.string().datetime(),
  })),
});

export const CompareQuerySchema = z.object({
  sessionIds: z.string(),
});

export const CompareSessionSchema = z.object({
  sessionId: z.string(),
  characterName: z.string(),
  huntLocation: z.string().nullable(),
  duration: z.number(),
  totalKills: z.number(),
  totalExperience: z.number(),
  totalLootValue: z.number(),
  xpPerHour: z.number(),
  killsPerHour: z.number(),
  lootPerHour: z.number(),
  startedAt: z.string().datetime(),
});

export const CompareDataSchema = z.object({
  sessions: z.array(CompareSessionSchema),
});

export type ProfitQuery = z.infer<typeof ProfitQuerySchema>;
export type ProfitData = z.infer<typeof ProfitDataSchema>;
export type CompareQuery = z.infer<typeof CompareQuerySchema>;
export type CompareData = z.infer<typeof CompareDataSchema>;
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
export type ExperienceHourly = z.infer<typeof ExperienceHourlySchema>;
export type KillsByCreature = z.infer<typeof KillsByCreatureSchema>;
export type LootSummary = z.infer<typeof LootSummarySchema>;
