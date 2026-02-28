import { z } from "zod";
import { DISCORD_WEBHOOK_URL_PATTERN } from "./constants.js";

const NotificationPreferencesSchema = z.object({
  sessionStarted: z.boolean().default(true),
  sessionEnded: z.boolean().default(true),
  death: z.boolean().default(true),
  levelUp: z.boolean().default(true),
  lootDrop: z.object({
    enabled: z.boolean().default(false),
    minValue: z.number().int().nonnegative().default(10_000),
  }).default({}),
  lowHp: z.object({
    enabled: z.boolean().default(false),
    threshold: z.number().int().min(1).max(100).default(20),
  }).default({}),
  botStuck: z.boolean().default(true),
  periodicStats: z.object({
    enabled: z.boolean().default(true),
    intervalMinutes: z.number().int().min(5).max(60).default(5),
  }).default({}),
});

export const CreateDiscordIntegrationSchema = z.object({
  webhookUrl: z.string().url().regex(DISCORD_WEBHOOK_URL_PATTERN, "Invalid Discord webhook URL"),
  label: z.string().min(1).max(100),
  notificationPreferences: NotificationPreferencesSchema.optional(),
});

export const UpdateDiscordIntegrationSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  webhookUrl: z.string().url().regex(DISCORD_WEBHOOK_URL_PATTERN, "Invalid Discord webhook URL").optional(),
  isActive: z.boolean().optional(),
  notificationPreferences: NotificationPreferencesSchema.partial().optional(),
});

export const DiscordIntegrationOutputSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  webhookId: z.string(),
  guildName: z.string().nullable(),
  channelName: z.string().nullable(),
  isActive: z.boolean(),
  notificationPreferences: NotificationPreferencesSchema,
  lastNotifiedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const DiscordIntegrationListSchema = z.array(DiscordIntegrationOutputSchema);

export type CreateDiscordIntegrationInput = z.infer<typeof CreateDiscordIntegrationSchema>;
export type UpdateDiscordIntegrationInput = z.infer<typeof UpdateDiscordIntegrationSchema>;
export type DiscordIntegrationOutput = z.infer<typeof DiscordIntegrationOutputSchema>;
