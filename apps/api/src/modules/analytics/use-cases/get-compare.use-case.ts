import type { Repository } from "typeorm";
import { In } from "typeorm";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { CompareData, CompareQuery } from "../schemas.js";
import { ForbiddenError } from "../../../shared/errors/index.js";

export class GetCompareUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, query: CompareQuery): Promise<CompareData> {
    const sessionIds = query.sessionIds.split(",").map((s) => s.trim()).filter(Boolean);

    if (sessionIds.length < 2 || sessionIds.length > 5) {
      throw new ForbiddenError("Provide 2-5 session IDs to compare");
    }

    const sessions = await this.sessionRepo.find({
      where: { id: In(sessionIds) },
      relations: ["character"],
    });

    for (const session of sessions) {
      if (session.character.userId !== userId) {
        throw new ForbiddenError("You do not own all selected sessions");
      }
    }

    return {
      sessions: sessions.map((s) => {
        const hours = s.duration / 3600;
        return {
          sessionId: s.id,
          characterName: s.character.name,
          huntLocation: s.huntLocation,
          duration: s.duration,
          totalKills: s.totalKills,
          totalExperience: Number(s.totalExperience),
          totalLootValue: s.totalLootValue,
          xpPerHour: s.xpPerHour,
          killsPerHour: hours > 0 ? Math.round(s.totalKills / hours) : 0,
          lootPerHour: hours > 0 ? Math.round(s.totalLootValue / hours) : 0,
          startedAt: s.startedAt.toISOString(),
        };
      }),
    };
  }
}
