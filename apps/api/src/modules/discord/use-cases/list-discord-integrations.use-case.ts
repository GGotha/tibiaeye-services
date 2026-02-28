import type { Repository } from "typeorm";
import type { DiscordIntegrationEntity } from "../../../entities/discord-integration.entity.js";
import type { DiscordIntegrationOutput } from "../schemas.js";
import { toOutput } from "./to-output.js";

export class ListDiscordIntegrationsUseCase {
  constructor(private readonly integrationRepo: Repository<DiscordIntegrationEntity>) {}

  async execute(userId: string): Promise<DiscordIntegrationOutput[]> {
    const integrations = await this.integrationRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    return integrations.map(toOutput);
  }
}
