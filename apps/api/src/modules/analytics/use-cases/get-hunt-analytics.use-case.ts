import type { Repository } from "typeorm";
import { In } from "typeorm";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { HuntAnalytics } from "../schemas.js";

export class GetHuntAnalyticsUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string): Promise<HuntAnalytics[]> {
    const characters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });

    if (characters.length === 0) {
      return [];
    }

    const characterIds = characters.map((c) => c.id);

    const result = await this.sessionRepo
      .createQueryBuilder("session")
      .select("session.huntLocation", "huntLocation")
      .addSelect("COUNT(*)", "sessions")
      .addSelect("SUM(EXTRACT(EPOCH FROM (COALESCE(session.endedAt, NOW()) - session.startedAt)))", "totalDuration")
      .addSelect("SUM(CAST(session.totalExperience AS numeric))", "totalExperience")
      .addSelect("SUM(session.totalKills)", "totalKills")
      .addSelect("SUM(session.totalLootValue)", "totalLootValue")
      .where("session.characterId IN (:...characterIds)", { characterIds })
      .andWhere("session.huntLocation IS NOT NULL")
      .groupBy("session.huntLocation")
      .orderBy("sessions", "DESC")
      .getRawMany();

    return result.map((row) => {
      const totalDuration = Number(row.totalDuration) || 0;
      const totalHours = totalDuration / 3600;
      const totalExperience = Number(row.totalExperience) || 0;
      const totalKills = Number(row.totalKills) || 0;
      const totalLootValue = Number(row.totalLootValue) || 0;

      return {
        huntLocation: row.huntLocation,
        sessions: Number(row.sessions),
        totalDuration: Math.round(totalDuration),
        avgXpPerHour: totalHours > 0.01 ? Math.round(totalExperience / totalHours) : 0,
        avgKillsPerHour: totalHours > 0.01 ? Math.round(totalKills / totalHours) : 0,
        totalLootValue,
        avgProfitPerHour: totalHours > 0.01 ? Math.round(totalLootValue / totalHours) : 0,
      };
    });
  }
}
