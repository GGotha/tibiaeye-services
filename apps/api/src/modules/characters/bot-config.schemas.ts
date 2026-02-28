import { z } from "zod";

// --- Healing ---

const PotionConfigSchema = z.object({
  enabled: z.boolean().optional(),
  threshold: z.number().min(0).max(100).optional(),
  hotkey: z.string().optional(),
  cooldown: z.number().min(0).optional(),
});

const SpellConfigSchema = z.object({
  name: z.string().optional(),
  enabled: z.boolean().optional(),
  threshold: z.number().min(0).max(100).optional(),
  spell: z.string().optional(),
  hotkey: z.string().optional(),
  minMana: z.number().min(0).optional(),
});

const FoodConfigSchema = z.object({
  enabled: z.boolean().optional(),
  threshold: z.number().min(0).optional(),
  hotkey: z.string().optional(),
  cooldown: z.number().min(0).optional(),
});

const HealingConfigSchema = z.object({
  healthPotion: PotionConfigSchema.optional(),
  manaPotion: PotionConfigSchema.optional(),
  spells: z.array(SpellConfigSchema).optional(),
  food: FoodConfigSchema.optional(),
});

// --- Cavebot ---

const CavebotConfigSchema = z.object({
  routeFile: z.string().optional(),
  startWaypoint: z.number().min(0).optional(),
  loop: z.boolean().optional(),
});

// --- Refill ---

const RefillConfigSchema = z.object({
  city: z.string().optional(),
  hpPotionMin: z.number().min(0).optional(),
  mpPotionMin: z.number().min(0).optional(),
  capMin: z.number().min(0).optional(),
  checkCapacity: z.boolean().optional(),
  hpPotionTarget: z.number().min(0).optional(),
  mpPotionTarget: z.number().min(0).optional(),
  depositGold: z.boolean().optional(),
  depositLoot: z.boolean().optional(),
  dropFlasks: z.boolean().optional(),
  lootBackpack: z.string().optional(),
  mainBackpack: z.string().optional(),
  stashBackpack: z.string().optional(),
  depotChest: z.number().min(1).optional(),
  returnLabel: z.string().optional(),
});

// --- General ---

const GeneralConfigSchema = z.object({
  tickRate: z.number().min(0.01).optional(),
  enableHealing: z.boolean().optional(),
  enableCavebot: z.boolean().optional(),
  enableLoot: z.boolean().optional(),
  lootHotkey: z.string().optional(),
  stuckAlertTimeout: z.number().min(0).optional(),
  enableStuckAlert: z.boolean().optional(),
  enableLogging: z.boolean().optional(),
  window: z.string().optional(),
});

// --- Targeting ---

const TargetingConfigSchema = z.object({
  enabled: z.boolean().optional(),
  mode: z.enum(["all", "whitelist", "blacklist"]).optional(),
  whitelist: z.array(z.string()).optional(),
  blacklist: z.array(z.string()).optional(),
});

// --- Reconnect ---

const ReconnectConfigSchema = z.object({
  enabled: z.boolean().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  maxRetries: z.number().min(0).optional(),
  delayBetweenRetries: z.number().min(0).optional(),
});

// --- Spell Attack ---

const SpellAttackGroupSchema = z.object({
  name: z.string().optional(),
  enabled: z.boolean().optional(),
  spell: z.string().optional(),
  hotkey: z.string().optional(),
  minMana: z.number().min(0).optional(),
  creatures: z.array(z.string()).optional(),
});

const SpellAttackConfigSchema = z.object({
  enabled: z.boolean().optional(),
  manaReservePercent: z.number().min(0).max(100).optional(),
  groups: z.array(SpellAttackGroupSchema).optional(),
});

// --- Hardware ---

const HardwareConfigSchema = z.object({
  mode: z.enum(["software", "arduino"]).optional(),
  arduinoPort: z.string().optional(),
  captureDevice: z.number().min(0).optional(),
});

// --- Server Save ---

const ServerSaveConfigSchema = z.object({
  enabled: z.boolean().optional(),
  time: z.string().optional(),
  windowMinutes: z.number().min(0).optional(),
  waitAfterKickSeconds: z.number().min(0).optional(),
});

// --- Full Config Schema (all fields optional) ---

export const BotConfigSchema = z.object({
  healing: HealingConfigSchema.optional(),
  cavebot: CavebotConfigSchema.optional(),
  refill: RefillConfigSchema.optional(),
  general: GeneralConfigSchema.optional(),
  targeting: TargetingConfigSchema.optional(),
  reconnect: ReconnectConfigSchema.optional(),
  spellAttack: SpellAttackConfigSchema.optional(),
  hardware: HardwareConfigSchema.optional(),
  serverSave: ServerSaveConfigSchema.optional(),
});

// --- Partial Config Schema (deep partial for PATCH) ---

export const BotConfigPartialSchema = BotConfigSchema.deepPartial();

// --- Response Schema ---

export const BotConfigResponseSchema = z.object({
  characterId: z.string().uuid(),
  config: z.record(z.unknown()),
  version: z.number(),
  updatedAt: z.string().nullable(),
});

// --- Types ---

export type BotConfig = z.infer<typeof BotConfigSchema>;
export type BotConfigPartial = z.infer<typeof BotConfigPartialSchema>;
export type BotConfigResponse = z.infer<typeof BotConfigResponseSchema>;
