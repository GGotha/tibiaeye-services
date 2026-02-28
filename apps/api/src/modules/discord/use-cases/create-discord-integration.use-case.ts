import type { Repository } from "typeorm";
import {
  DiscordIntegrationEntity,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "../../../entities/discord-integration.entity.js";
import { AppError } from "../../../shared/errors/index.js";
import { validateWebhook, extractWebhookId } from "../../../shared/discord/webhook-client.js";
import { MAX_INTEGRATIONS_PER_USER } from "../constants.js";
import type { CreateDiscordIntegrationInput, DiscordIntegrationOutput } from "../schemas.js";
import { toOutput } from "./to-output.js";

export class CreateDiscordIntegrationUseCase {
  constructor(private readonly integrationRepo: Repository<DiscordIntegrationEntity>) {}

  async execute(userId: string, input: CreateDiscordIntegrationInput): Promise<DiscordIntegrationOutput> {
    const existingCount = await this.integrationRepo.count({ where: { userId } });
    if (existingCount >= MAX_INTEGRATIONS_PER_USER) {
      throw new AppError(
        `Maximum of ${MAX_INTEGRATIONS_PER_USER} Discord integrations allowed`,
        422,
        "MAX_INTEGRATIONS_REACHED",
      );
    }

    const webhookInfo = await validateWebhook(input.webhookUrl);

    const integration = this.integrationRepo.create({
      userId,
      label: input.label,
      webhookUrl: input.webhookUrl,
      webhookId: extractWebhookId(input.webhookUrl),
      guildName: webhookInfo.guildName,
      channelName: webhookInfo.channelName,
      isActive: true,
      notificationPreferences: {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...input.notificationPreferences,
      },
      lastNotifiedAt: null,
    });

    const saved = await this.integrationRepo.save(integration);
    return toOutput(saved);
  }
}
