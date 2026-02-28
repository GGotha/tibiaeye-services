import type { DiscordIntegrationEntity } from "../../../entities/discord-integration.entity.js";
import type { DiscordIntegrationOutput } from "../schemas.js";

export function toOutput(entity: DiscordIntegrationEntity): DiscordIntegrationOutput {
  return {
    id: entity.id,
    label: entity.label,
    webhookId: entity.webhookId,
    guildName: entity.guildName,
    channelName: entity.channelName,
    isActive: entity.isActive,
    notificationPreferences: entity.notificationPreferences,
    lastNotifiedAt: entity.lastNotifiedAt?.toISOString() ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
