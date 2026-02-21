import type { Repository } from "typeorm";
import { In } from "typeorm";
import { KillEntity } from "../../../entities/kill.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { AnalyticsQuery, KillsByCreature } from "../schemas.js";

export class GetKillsByCreatureUseCase {
  constructor(
    private readonly killRepo: Repository<KillEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, query: AnalyticsQuery): Promise<KillsByCreature[]> {
    // Get user's characters
    const characters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });

    if (characters.length === 0) {
      return [];
    }

    const characterIds = characters.map((c) => c.id);

    // Build session filter
    let sessionIds: string[] = [];

    if (query.sessionId) {
      const session = await this.sessionRepo.findOne({
        where: { id: query.sessionId },
      });

      if (!session || !characterIds.includes(session.characterId)) {
        return [];
      }

      sessionIds = [query.sessionId];
    } else if (query.characterId) {
      if (!characterIds.includes(query.characterId)) {
        return [];
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
      return [];
    }

    // Get kills grouped by creature
    const result = await this.killRepo
      .createQueryBuilder("kill")
      .select("kill.creatureName", "creatureName")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(COALESCE(kill.experienceGained, 0))", "totalExperience")
      .where("kill.sessionId IN (:...sessionIds)", { sessionIds })
      .groupBy("kill.creatureName")
      .orderBy("count", "DESC")
      .limit(50)
      .getRawMany();

    return result.map((row) => ({
      creatureName: row.creatureName,
      totalKills: Number(row.count),
      totalExperience: Number(row.totalExperience) || 0,
    }));
  }
}
