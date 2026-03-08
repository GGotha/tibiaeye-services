import type { Repository } from "typeorm";
import { In } from "typeorm";
import { SessionEntity, SessionStatus } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { SessionOutput } from "../schemas.js";

export class GetActiveSessionsUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string): Promise<SessionOutput[]> {
    const characters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });

    const characterIds = characters.map((c) => c.id);

    if (characterIds.length === 0) {
      return [];
    }

    const sessions = await this.sessionRepo.find({
      where: {
        characterId: In(characterIds),
        status: SessionStatus.ACTIVE,
      },
      relations: ["character"],
      order: { startedAt: "DESC" },
    });

    return sessions.map((session) => ({
      id: session.id,
      characterId: session.characterId,
      characterName: session.character.name,
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
    }));
  }
}
