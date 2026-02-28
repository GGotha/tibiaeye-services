import type { Repository } from "typeorm";
import { In } from "typeorm";
import { KillEntity } from "../../../entities/kill.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { AnalyticsQuery, KillsHeatmapPoint } from "../schemas.js";

export class GetKillsHeatmapUseCase {
  constructor(
    private readonly killRepo: Repository<KillEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, query: AnalyticsQuery): Promise<KillsHeatmapPoint[]> {
    const characters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });

    if (characters.length === 0) {
      return [];
    }

    const characterIds = characters.map((c) => c.id);

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

    const qb = this.killRepo
      .createQueryBuilder("kill")
      .select("kill.positionX", "x")
      .addSelect("kill.positionY", "y")
      .addSelect("kill.positionZ", "z")
      .addSelect("COUNT(*)", "kills")
      .addSelect("SUM(COALESCE(kill.experienceGained, 0))", "totalExperience")
      .where("kill.sessionId IN (:...sessionIds)", { sessionIds })
      .andWhere("kill.positionX IS NOT NULL")
      .andWhere("kill.positionY IS NOT NULL")
      .andWhere("kill.positionZ IS NOT NULL");

    if (query.startDate) {
      qb.andWhere("kill.killedAt >= :startDate", { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere("kill.killedAt <= :endDate", { endDate: query.endDate });
    }

    const result = await qb
      .groupBy("kill.positionX")
      .addGroupBy("kill.positionY")
      .addGroupBy("kill.positionZ")
      .orderBy("kills", "DESC")
      .limit(500)
      .getRawMany();

    return result.map((row) => ({
      x: Number(row.x),
      y: Number(row.y),
      z: Number(row.z),
      kills: Number(row.kills),
      totalExperience: Number(row.totalExperience) || 0,
    }));
  }
}
