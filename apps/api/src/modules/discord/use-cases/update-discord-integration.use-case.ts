import type { Repository } from "typeorm";
import type { DiscordIntegrationEntity } from "../../../entities/discord-integration.entity.js";
import { ForbiddenError, NotFoundError } from "../../../shared/errors/index.js";
import { validateWebhook, extractWebhookId } from "../../../shared/discord/webhook-client.js";
import type { UpdateDiscordIntegrationInput, DiscordIntegrationOutput } from "../schemas.js";
import { toOutput } from "./to-output.js";

export class UpdateDiscordIntegrationUseCase {
  constructor(private readonly integrationRepo: Repository<DiscordIntegrationEntity>) {}

  async execute(
    userId: string,
    integrationId: string,
    input: UpdateDiscordIntegrationInput,
  ): Promise<DiscordIntegrationOutput> {
    const integration = await this.integrationRepo.findOne({ where: { id: integrationId } });
    if (!integration) {
      throw new NotFoundError("Discord integration not found");
    }

    if (integration.userId !== userId) {
      throw new ForbiddenError("You do not own this integration");
    }

    if (input.webhookUrl && input.webhookUrl !== integration.webhookUrl) {
      const webhookInfo = await validateWebhook(input.webhookUrl);
      integration.webhookUrl = input.webhookUrl;
      integration.webhookId = extractWebhookId(input.webhookUrl);
      integration.guildName = webhookInfo.guildName;
      integration.channelName = webhookInfo.channelName;
    }

    if (input.label !== undefined) {
      integration.label = input.label;
    }

    if (input.isActive !== undefined) {
      integration.isActive = input.isActive;
    }

    if (input.notificationPreferences) {
      integration.notificationPreferences = {
        ...integration.notificationPreferences,
        ...input.notificationPreferences,
      };
    }

    const saved = await this.integrationRepo.save(integration);
    return toOutput(saved);
  }
}
