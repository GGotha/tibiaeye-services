import type { Repository } from "typeorm";
import { In } from "typeorm";
import { LootEntity } from "../../../entities/loot.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { AnalyticsQuery, LootSummary } from "../schemas.js";

export class GetLootSummaryUseCase {
  constructor(
    private readonly lootRepo: Repository<LootEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, query: AnalyticsQuery): Promise<LootSummary> {
    // Get user's characters
    const characters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });

    if (characters.length === 0) {
      return { items: [], totalValue: 0, totalItems: 0 };
    }

    const characterIds = characters.map((c) => c.id);

    // Build session filter
    let sessionIds: string[] = [];

    if (query.sessionId) {
      const session = await this.sessionRepo.findOne({
        where: { id: query.sessionId },
      });

      if (!session || !characterIds.includes(session.characterId)) {
        return { items: [], totalValue: 0, totalItems: 0 };
      }

      sessionIds = [query.sessionId];
    } else if (query.characterId) {
      if (!characterIds.includes(query.characterId)) {
        return { items: [], totalValue: 0, totalItems: 0 };
      }

      const sessions = await this.sessionRepo.find({
        where: { characterId: query.characterId },
        select: ["id"],
      });

      sessionIds = sessions.map((s) => s.id);
    } else {
      const sessions = await this.sessionRepo.find({
        where: { characterId: In(characterIds) },
        select: ["id"],
      });

      sessionIds = sessions.map((s) => s.id);
    }

    if (sessionIds.length === 0) {
      return { items: [], totalValue: 0, totalItems: 0 };
    }

    // Get loot grouped by item
    const result = await this.lootRepo
      .createQueryBuilder("loot")
      .select("loot.itemName", "itemName")
      .addSelect("SUM(loot.quantity)", "quantity")
      .addSelect("SUM(COALESCE(loot.estimatedValue, 0) * loot.quantity)", "totalValue")
      .where("loot.sessionId IN (:...sessionIds)", { sessionIds })
      .groupBy("loot.itemName")
      .orderBy("totalValue", "DESC")
      .limit(100)
      .getRawMany();

    const items = result.map((row) => ({
      itemName: row.itemName,
      quantity: Number(row.quantity),
      totalValue: Number(row.totalValue) || 0,
    }));

    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, totalValue, totalItems };
  }
}
