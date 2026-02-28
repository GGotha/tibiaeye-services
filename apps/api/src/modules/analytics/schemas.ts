import { z } from "zod";

export const AnalyticsQuerySchema = z.object({
  sessionId: z.string().uuid().optional(),
  characterId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const ExperienceHourlyDataPointSchema = z.object({
  timestamp: z.string(),
  xpPerHour: z.number(),
  level: z.number(),
});

export const ExperienceHourlyResponseSchema = z.object({
  xpPerHourAverage: z.number(),
  dataPoints: z.array(ExperienceHourlyDataPointSchema),
});

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

export const KillsHeatmapPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  kills: z.number(),
  totalExperience: z.number(),
});

export const KillsHeatmapListSchema = z.array(KillsHeatmapPointSchema);

export const HuntAnalyticsSchema = z.object({
  huntLocation: z.string(),
  sessions: z.number(),
  totalDuration: z.number(),
  avgXpPerHour: z.number(),
  avgKillsPerHour: z.number(),
  totalLootValue: z.number(),
  avgProfitPerHour: z.number(),
});

export const HuntAnalyticsListSchema = z.array(HuntAnalyticsSchema);

export const PositionHeatmapPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  visits: z.number(),
});

export const PositionHeatmapListSchema = z.array(PositionHeatmapPointSchema);

export const PositionHeatmapQuerySchema = z.object({
  sessionId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const TimelineQuerySchema = z.object({
  sessionId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().datetime().optional(),
});

export const TimelineEventSchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  data: z.record(z.unknown()).nullable(),
});

export const TimelineResponseSchema = z.object({
  events: z.array(TimelineEventSchema),
  nextCursor: z.string().nullable(),
});

// Route Segment Analytics
export const RouteSegmentsQuerySchema = z.object({
  routeId: z.string().uuid(),
});

export const RouteSegmentSchema = z.object({
  fromIndex: z.number(),
  toIndex: z.number(),
  avgSeconds: z.number(),
  medianSeconds: z.number(),
  p95Seconds: z.number(),
  minSeconds: z.number(),
  maxSeconds: z.number(),
  sampleCount: z.number(),
  isSlow: z.boolean(),
  isHighVariance: z.boolean(),
});

export const RouteSegmentAnalyticsSchema = z.object({
  segments: z.array(RouteSegmentSchema),
  totalAvgLoopSeconds: z.number(),
  sessionCount: z.number(),
  globalAvgSegmentSeconds: z.number(),
});

// Route AI Suggestions
export const RouteSuggestionsBodySchema = z.object({
  routeId: z.string().uuid(),
});

export const RouteSuggestionSchema = z.object({
  type: z.string(),
  segmentFrom: z.number(),
  segmentTo: z.number(),
  description: z.string(),
  estimatedSavingsSeconds: z.number(),
  priority: z.enum(["high", "medium", "low"]),
});

export const RouteSuggestionsSchema = z.object({
  summary: z.string(),
  overallScore: z.number(),
  suggestions: z.array(RouteSuggestionSchema),
  analyzedAt: z.string(),
});

export type TimelineQuery = z.infer<typeof TimelineQuerySchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type TimelineResponse = z.infer<typeof TimelineResponseSchema>;

export type ProfitQuery = z.infer<typeof ProfitQuerySchema>;
export type ProfitData = z.infer<typeof ProfitDataSchema>;
export type CompareQuery = z.infer<typeof CompareQuerySchema>;
export type CompareData = z.infer<typeof CompareDataSchema>;
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
export type ExperienceHourlyResponse = z.infer<typeof ExperienceHourlyResponseSchema>;
export type KillsByCreature = z.infer<typeof KillsByCreatureSchema>;
export type LootSummary = z.infer<typeof LootSummarySchema>;
export type KillsHeatmapPoint = z.infer<typeof KillsHeatmapPointSchema>;
export type HuntAnalytics = z.infer<typeof HuntAnalyticsSchema>;
export type PositionHeatmapQuery = z.infer<typeof PositionHeatmapQuerySchema>;
export type PositionHeatmapPoint = z.infer<typeof PositionHeatmapPointSchema>;
export type RouteSegmentsQuery = z.infer<typeof RouteSegmentsQuerySchema>;
export type RouteSegmentAnalytics = z.infer<typeof RouteSegmentAnalyticsSchema>;
export type RouteSuggestionsBody = z.infer<typeof RouteSuggestionsBodySchema>;
export type RouteSuggestions = z.infer<typeof RouteSuggestionsSchema>;
