import type { Repository } from "typeorm";
import { In } from "typeorm";
import { SessionEntity, SessionStatus } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { SessionOutput } from "../schemas.js";

export class GetActiveSessionUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string): Promise<SessionOutput | null> {
    // Get all character IDs for this user
    const characters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });

    const characterIds = characters.map((c) => c.id);

    if (characterIds.length === 0) {
      return null;
    }

    const session = await this.sessionRepo.findOne({
      where: {
        characterId: In(characterIds),
        status: SessionStatus.ACTIVE,
      },
      relations: ["character"],
      order: { startedAt: "DESC" },
    });

    if (!session) {
      return null;
    }

    return {
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
    };
  }
}
