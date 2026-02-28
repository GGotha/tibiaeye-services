import type { Repository } from "typeorm";
import type { DiscordIntegrationEntity } from "../../../entities/discord-integration.entity.js";
import { ForbiddenError, NotFoundError } from "../../../shared/errors/index.js";

export class DeleteDiscordIntegrationUseCase {
  constructor(private readonly integrationRepo: Repository<DiscordIntegrationEntity>) {}

  async execute(userId: string, integrationId: string): Promise<void> {
    const integration = await this.integrationRepo.findOne({ where: { id: integrationId } });
    if (!integration) {
      throw new NotFoundError("Discord integration not found");
    }

    if (integration.userId !== userId) {
      throw new ForbiddenError("You do not own this integration");
    }

    await this.integrationRepo.remove(integration);
  }
}
