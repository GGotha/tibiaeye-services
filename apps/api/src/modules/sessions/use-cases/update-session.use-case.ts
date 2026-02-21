import type { Repository } from "typeorm";
import { SessionEntity, SessionStatus } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { NotFoundError, ForbiddenError } from "../../../shared/errors/index.js";
import type { UpdateSessionInput, SessionOutput } from "../schemas.js";

export class UpdateSessionUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, sessionId: string, input: UpdateSessionInput): Promise<SessionOutput> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ["character"],
    });

    if (!session) {
      throw new NotFoundError("Session not found");
    }

    // Verify the session belongs to the user
    if (session.character.userId !== userId) {
      throw new ForbiddenError("You do not own this session");
    }

    // Update fields
    if (input.status !== undefined) {
      session.status = input.status as SessionStatus;
      if (input.status === "completed" || input.status === "crashed") {
        session.endedAt = new Date();
      }
    }

    if (input.huntLocation !== undefined) {
      session.huntLocation = input.huntLocation;
    }

    if (input.finalLevel !== undefined) {
      session.finalLevel = input.finalLevel;
    }

    if (input.finalExperience !== undefined) {
      session.finalExperience = input.finalExperience;
    }

    if (input.totalKills !== undefined) {
      session.totalKills = input.totalKills;
    }

    if (input.totalExperience !== undefined) {
      session.totalExperience = input.totalExperience;
    }

    if (input.totalLootValue !== undefined) {
      session.totalLootValue = input.totalLootValue;
    }

    await this.sessionRepo.save(session);

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
