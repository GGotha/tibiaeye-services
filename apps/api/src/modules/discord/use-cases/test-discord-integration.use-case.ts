import type { Repository } from "typeorm";
import type { DiscordIntegrationEntity } from "../../../entities/discord-integration.entity.js";
import { ForbiddenError, NotFoundError } from "../../../shared/errors/index.js";
import { sendEmbed } from "../../../shared/discord/webhook-client.js";
import { buildTestEmbed } from "../../../shared/discord/embed-builder.js";

export class TestDiscordIntegrationUseCase {
  constructor(private readonly integrationRepo: Repository<DiscordIntegrationEntity>) {}

  async execute(userId: string, integrationId: string): Promise<{ success: boolean }> {
    const integration = await this.integrationRepo.findOne({ where: { id: integrationId } });
    if (!integration) {
      throw new NotFoundError("Discord integration not found");
    }

    if (integration.userId !== userId) {
      throw new ForbiddenError("You do not own this integration");
    }

    const embed = buildTestEmbed();
    const result = await sendEmbed(integration.webhookUrl, embed);

    if (result.webhookDeleted) {
      await this.integrationRepo.update(integration.id, { isActive: false });
      throw new NotFoundError("Webhook has been deleted from Discord");
    }

    return { success: result.success };
  }
}
