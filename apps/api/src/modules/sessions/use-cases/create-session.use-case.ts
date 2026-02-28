import type { Repository } from "typeorm";
import { SessionEntity, SessionStatus } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { NotFoundError, ForbiddenError } from "../../../shared/errors/index.js";
import type { CreateSessionInput, SessionOutput } from "../schemas.js";

export class CreateSessionUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, input: CreateSessionInput): Promise<SessionOutput> {
    // Verify character exists and belongs to user
    const character = await this.characterRepo.findOne({
      where: { id: input.characterId },
    });

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    if (character.userId !== userId) {
      throw new ForbiddenError("You do not own this character");
    }

    // Auto-close any active session (crashed/abrupt stop)
    const activeSession = await this.sessionRepo.findOne({
      where: { characterId: input.characterId, status: SessionStatus.ACTIVE },
    });

    if (activeSession) {
      activeSession.status = SessionStatus.COMPLETED;
      activeSession.endedAt = new Date();
      await this.sessionRepo.save(activeSession);
    }

    const session = this.sessionRepo.create({
      characterId: input.characterId,
      huntLocation: input.huntLocation || null,
      routeId: input.routeId || null,
      status: SessionStatus.ACTIVE,
      initialLevel: input.initialLevel || null,
      initialExperience: input.initialExperience || null,
    });

    await this.sessionRepo.save(session);

    return this.toOutput(session, character.name);
  }

  private toOutput(session: SessionEntity, characterName: string): SessionOutput {
    return {
      id: session.id,
      characterId: session.characterId,
      characterName,
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
