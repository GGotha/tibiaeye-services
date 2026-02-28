export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "user" | "admin";
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  world: string;
  level: number | null;
  vocation: string | null;
  createdAt: string;
}

export interface CharacterWithStatus extends Character {
  hasActiveSession: boolean;
  activeSessionId: string | null;
}

export interface Session {
  id: string;
  characterId: string;
  characterName: string;
  huntLocation: string | null;
  status: "active" | "completed" | "crashed";
  startedAt: string;
  endedAt: string | null;
  totalKills: number;
  totalExperience: string;
  totalLootValue: number;
  xpPerHour: number;
  duration: number;
}

export interface SessionDetail extends Session {
  kills: Kill[];
  loot: Loot[];
  experienceSnapshots: ExperienceSnapshot[];
}

export interface Kill {
  id: string;
  creatureName: string;
  experienceGained: number | null;
  killedAt: string;
}

export interface Loot {
  id: string;
  itemName: string;
  quantity: number;
  estimatedValue: number | null;
  lootedAt: string;
}

export interface ExperienceSnapshot {
  experience: number;
  level: number;
  recordedAt: string;
}

export interface ExperienceHourly {
  xpPerHourAverage: number;
  dataPoints: Array<{
    timestamp: string;
    xpPerHour: number;
    level: number;
  }>;
}

export interface KillsByCreature {
  creatureName: string;
  totalKills: number;
  totalExperience: number;
}

export interface LootSummary {
  items: Array<{
    itemName: string;
    quantity: number;
    totalValue: number;
  }>;
  totalValue: number;
}

export interface LicenseStatus {
  id: string;
  status: "active" | "revoked";
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  totalRequests: number;
  subscription: {
    id: string;
    status: "active" | "cancelled" | "past_due" | "trialing";
    currentPeriodEnd: string;
    daysRemaining: number;
  };
}

export interface Subscription {
  id: string;
  planId: string;
  plan: {
    name: string;
    price: number;
  };
  status: "active" | "cancelled" | "past_due";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface BotStatus {
  hpPercent: number;
  manaPercent: number;
  botState: "running" | "paused" | "reconnecting" | "stopped";
  targetCreature: string | null;
  currentTask: string | null;
  speed: number | null;
  stamina: number | null;
  capacity: number | null;
}

export interface ProfitSession {
  sessionId: string;
  huntLocation: string | null;
  duration: number;
  lootValue: number;
  suppliesCost: number;
  netProfit: number;
  startedAt: string;
}

export interface ProfitData {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitPerHour: number;
  sessions: ProfitSession[];
}

export interface CompareSession {
  sessionId: string;
  characterName: string;
  huntLocation: string | null;
  duration: number;
  totalKills: number;
  totalExperience: number;
  totalLootValue: number;
  xpPerHour: number;
  killsPerHour: number;
  lootPerHour: number;
  startedAt: string;
}

export interface CompareData {
  sessions: CompareSession[];
}

export interface GameEvent {
  id: string;
  type: "death" | "level_up" | "refill" | "heal" | "pause" | "resume" | "disconnect" | "reconnect_retry" | "reconnect_success" | "reconnect_failure" | "warning";
  data: Record<string, unknown> | null;
  createdAt: string;
}

export interface KillsHeatmapPoint {
  x: number;
  y: number;
  z: number;
  kills: number;
  totalExperience: number;
}

export interface HuntAnalytics {
  huntLocation: string;
  sessions: number;
  totalDuration: number;
  avgXpPerHour: number;
  avgKillsPerHour: number;
  totalLootValue: number;
  avgProfitPerHour: number;
}

export interface PositionLog {
  x: number;
  y: number;
  z: number;
  recordedAt: string;
}

export interface PositionHeatmapPoint {
  x: number;
  y: number;
  z: number;
  visits: number;
}

export interface TimelineEvent {
  type: string;
  timestamp: string;
  data: Record<string, unknown> | null;
}

export interface TimelineResponse {
  events: TimelineEvent[];
  nextCursor: string | null;
}

export interface NotificationPreferences {
  sessionStarted: boolean;
  sessionEnded: boolean;
  death: boolean;
  levelUp: boolean;
  lootDrop: {
    enabled: boolean;
    minValue: number;
  };
  lowHp: {
    enabled: boolean;
    threshold: number;
  };
  botStuck: boolean;
  periodicStats: {
    enabled: boolean;
    intervalMinutes: number;
  };
}

export interface DiscordIntegration {
  id: string;
  label: string;
  webhookId: string;
  guildName: string | null;
  channelName: string | null;
  isActive: boolean;
  notificationPreferences: NotificationPreferences;
  lastNotifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscordIntegrationInput {
  webhookUrl: string;
  label: string;
  notificationPreferences?: Partial<NotificationPreferences>;
}

export interface UpdateDiscordIntegrationInput {
  label?: string;
  webhookUrl?: string;
  isActive?: boolean;
  notificationPreferences?: Partial<NotificationPreferences>;
}

// Routes / Waypoints
export interface RouteWaypoint {
  id: number;
  type: string;
  coordinate?: [number, number, number];
  label?: string;
  options?: Record<string, unknown>;
  comment?: string;
}

export interface BotRoute {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  characterId: string | null;
  waypoints: RouteWaypoint[];
  metadata: Record<string, unknown> | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Route Analytics
export interface RouteSegment {
  fromIndex: number;
  toIndex: number;
  avgSeconds: number;
  medianSeconds: number;
  p95Seconds: number;
  minSeconds: number;
  maxSeconds: number;
  sampleCount: number;
  isSlow: boolean;
  isHighVariance: boolean;
}

export interface RouteSegmentAnalytics {
  segments: RouteSegment[];
  totalAvgLoopSeconds: number;
  sessionCount: number;
  globalAvgSegmentSeconds: number;
}

export interface RouteSuggestion {
  type: string;
  segmentFrom: number;
  segmentTo: number;
  description: string;
  estimatedSavingsSeconds: number;
  priority: "high" | "medium" | "low";
}

export interface RouteSuggestions {
  summary: string;
  overallScore: number;
  suggestions: RouteSuggestion[];
  analyzedAt: string;
}

export interface SessionFilters {
  page?: number;
  limit?: number;
  characterId?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Bot Config types
export interface HealingPotionConfig {
  enabled?: boolean;
  threshold?: number;
  hotkey?: string;
  cooldown?: number;
}

export interface HealingSpellConfig {
  name?: string;
  enabled?: boolean;
  threshold?: number;
  spell?: string;
  hotkey?: string;
  minMana?: number;
}

export interface FoodConfig {
  enabled?: boolean;
  threshold?: number;
  hotkey?: string;
  cooldown?: number;
}

export interface HealingConfig {
  healthPotion?: HealingPotionConfig;
  manaPotion?: HealingPotionConfig;
  spells?: HealingSpellConfig[];
  food?: FoodConfig;
}

export interface CavebotConfig {
  routeFile?: string;
  startWaypoint?: number;
  loop?: boolean;
}

export interface RefillConfig {
  city?: string;
  hpPotionMin?: number;
  mpPotionMin?: number;
  capMin?: number;
  checkCapacity?: boolean;
  hpPotionTarget?: number;
  mpPotionTarget?: number;
  depositGold?: boolean;
  depositLoot?: boolean;
  dropFlasks?: boolean;
  lootBackpack?: string;
  mainBackpack?: string;
  stashBackpack?: string;
  depotChest?: number;
  returnLabel?: string;
}

export interface GeneralConfig {
  tickRate?: number;
  enableHealing?: boolean;
  enableCavebot?: boolean;
  enableLoot?: boolean;
  lootHotkey?: string;
  stuckAlertTimeout?: number;
  enableStuckAlert?: boolean;
  enableLogging?: boolean;
  window?: string;
}

export interface TargetingConfig {
  enabled?: boolean;
  mode?: "all" | "whitelist" | "blacklist";
  whitelist?: string[];
  blacklist?: string[];
}

export interface SpellAttackGroup {
  name?: string;
  enabled?: boolean;
  spell?: string;
  hotkey?: string;
  minMana?: number;
  cooldown?: number;
}

export interface SpellAttackConfig {
  enabled?: boolean;
  manaReservePercent?: number;
  groups?: SpellAttackGroup[];
}

export interface ReconnectConfig {
  enabled?: boolean;
  email?: string;
  password?: string;
  maxRetries?: number;
  delayBetweenRetries?: number;
}

export interface HardwareConfig {
  mode?: "software" | "arduino";
  arduinoPort?: string;
  captureDevice?: number;
}

export interface ServerSaveConfig {
  enabled?: boolean;
  time?: string;
  windowMinutes?: number;
  waitAfterKickSeconds?: number;
}

export interface BotConfig {
  healing?: HealingConfig;
  cavebot?: CavebotConfig;
  refill?: RefillConfig;
  general?: GeneralConfig;
  targeting?: TargetingConfig;
  spellAttack?: SpellAttackConfig;
  reconnect?: ReconnectConfig;
  hardware?: HardwareConfig;
  serverSave?: ServerSaveConfig;
}

export interface BotConfigResponse {
  config: BotConfig;
  version: number;
  characterId: string;
  updatedAt: string;
}
