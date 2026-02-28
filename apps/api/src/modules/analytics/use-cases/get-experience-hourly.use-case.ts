import type { Repository } from "typeorm";
import { In } from "typeorm";
import { ExperienceSnapshotEntity } from "../../../entities/experience-snapshot.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { AnalyticsQuery, ExperienceHourlyResponse } from "../schemas.js";

export class GetExperienceHourlyUseCase {
  constructor(
    private readonly experienceRepo: Repository<ExperienceSnapshotEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, query: AnalyticsQuery): Promise<ExperienceHourlyResponse> {
    // Get user's characters
    const characters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });

    const emptyResponse: ExperienceHourlyResponse = { xpPerHourAverage: 0, dataPoints: [] };

    if (characters.length === 0) {
      return emptyResponse;
    }

    const characterIds = characters.map((c) => c.id);

    // Build session filter
    let sessionIds: string[] = [];

    if (query.sessionId) {
      // Verify session belongs to user
      const session = await this.sessionRepo.findOne({
        where: { id: query.sessionId },
      });

      if (!session || !characterIds.includes(session.characterId)) {
        return emptyResponse;
      }

      sessionIds = [query.sessionId];
    } else if (query.characterId) {
      if (!characterIds.includes(query.characterId)) {
        return emptyResponse;
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
      return { xpPerHourAverage: 0, dataPoints: [] };
    }

    // Get experience snapshots grouped by hour
    const result = await this.experienceRepo
      .createQueryBuilder("snapshot")
      .select("TO_CHAR(snapshot.recordedAt, 'YYYY-MM-DD HH24:00:00')", "hour")
      .addSelect("MAX(snapshot.experience) - MIN(snapshot.experience)", "experience")
      .addSelect("MAX(snapshot.level)", "level")
      .where("snapshot.sessionId IN (:...sessionIds)", { sessionIds })
      .groupBy("hour")
      .orderBy("hour", "ASC")
      .getRawMany();

    const dataPoints = result.map((row) => ({
      timestamp: row.hour,
      xpPerHour: Number(row.experience) || 0,
      level: Number(row.level) || 0,
    }));

    const xpPerHourAverage = dataPoints.length > 0
      ? Math.round(dataPoints.reduce((sum, p) => sum + p.xpPerHour, 0) / dataPoints.length)
      : 0;

    return { xpPerHourAverage, dataPoints };
  }
}
