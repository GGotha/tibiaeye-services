import type { Repository } from "typeorm";
import { PositionLogEntity } from "../../../entities/position-log.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";

export interface PositionHeatmapPoint {
  x: number;
  y: number;
  z: number;
  visits: number;
}

interface PositionHeatmapQuery {
  sessionId: string;
  startDate?: string;
  endDate?: string;
}

export class GetPositionHeatmapUseCase {
  constructor(
    private readonly positionLogRepo: Repository<PositionLogEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, query: PositionHeatmapQuery): Promise<PositionHeatmapPoint[]> {
    const characters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });

    if (characters.length === 0) return [];

    const characterIds = characters.map((c) => c.id);

    const session = await this.sessionRepo.findOne({
      where: { id: query.sessionId },
    });

    if (!session || !characterIds.includes(session.characterId)) return [];

    const qb = this.positionLogRepo
      .createQueryBuilder("pl")
      .select("pl.x", "x")
      .addSelect("pl.y", "y")
      .addSelect("pl.z", "z")
      .addSelect("COUNT(*)", "visits")
      .where("pl.sessionId = :sessionId", { sessionId: query.sessionId });

    if (query.startDate) {
      qb.andWhere("pl.recordedAt >= :startDate", { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere("pl.recordedAt <= :endDate", { endDate: query.endDate });
    }

    const result = await qb
      .groupBy("pl.x")
      .addGroupBy("pl.y")
      .addGroupBy("pl.z")
      .orderBy("visits", "DESC")
      .limit(1000)
      .getRawMany();

    return result.map((row) => ({
      x: Number(row.x),
      y: Number(row.y),
      z: Number(row.z),
      visits: Number(row.visits),
    }));
  }
}
