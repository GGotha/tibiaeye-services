import type { Repository } from "typeorm";
import { In } from "typeorm";
import { ExperienceSnapshotEntity } from "../../../entities/experience-snapshot.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { AnalyticsQuery, ExperienceHourly } from "../schemas.js";

export class GetExperienceHourlyUseCase {
  constructor(
    private readonly experienceRepo: Repository<ExperienceSnapshotEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, query: AnalyticsQuery): Promise<ExperienceHourly[]> {
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
      // Verify session belongs to user
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

    // Get experience snapshots grouped by hour
    const result = await this.experienceRepo
      .createQueryBuilder("snapshot")
      .select("DATE_FORMAT(snapshot.recordedAt, '%Y-%m-%d %H:00:00')", "hour")
      .addSelect("MAX(snapshot.experience) - MIN(snapshot.experience)", "experience")
      .where("snapshot.sessionId IN (:...sessionIds)", { sessionIds })
      .groupBy("hour")
      .orderBy("hour", "ASC")
      .getRawMany();

    return result.map((row) => ({
      hour: row.hour,
      experience: Number(row.experience) || 0,
      xpPerHour: Number(row.experience) || 0, // Same as experience for hourly
    }));
  }
}
