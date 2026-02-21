import type { Repository, FindOptionsWhere } from "typeorm";
import { SessionEntity, SessionStatus } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { SessionQuery, SessionOutput } from "../schemas.js";

interface PaginatedSessionOutput {
  data: SessionOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListSessionsUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, query: SessionQuery): Promise<PaginatedSessionOutput> {
    const characters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });

    const characterIds = characters.map((c) => c.id);

    if (characterIds.length === 0) {
      return { data: [], total: 0, page: query.page, limit: query.limit, totalPages: 0 };
    }

    const where: FindOptionsWhere<SessionEntity> = {};

    if (query.characterId) {
      if (!characterIds.includes(query.characterId)) {
        return { data: [], total: 0, page: query.page, limit: query.limit, totalPages: 0 };
      }
      where.characterId = query.characterId;
    }

    if (query.status) {
      where.status = query.status as SessionStatus;
    }

    const whereClause = query.characterId
      ? where
      : characterIds.map((id) => ({ ...where, characterId: id }));

    const skip = (query.page - 1) * query.limit;

    const [sessions, total] = await this.sessionRepo.findAndCount({
      where: whereClause,
      relations: ["character"],
      order: { startedAt: "DESC" },
      take: query.limit,
      skip,
    });

    const totalPages = Math.ceil(total / query.limit);

    return {
      data: sessions.map((session) => this.toOutput(session)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  private toOutput(session: SessionEntity): SessionOutput {
    return {
      id: session.id,
      characterId: session.characterId,
      characterName: session.character?.name ?? "Unknown",
      huntLocation: session.huntLocation,
      status: session.status,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt?.toISOString() || null,
      initialLevel: session.initialLevel,
      initialExperience: session.initialExperience,
      finalLevel: session.finalLevel,
      finalExperience: session.finalExperience,
      totalKills: session.totalKills,
      totalExperience: session.totalExperience,
      totalLootValue: session.totalLootValue,
      duration: session.duration,
      xpPerHour: session.xpPerHour,
    };
  }
}
