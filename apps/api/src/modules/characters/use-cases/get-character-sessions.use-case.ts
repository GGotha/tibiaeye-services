import type { Repository } from "typeorm";
import type { CharacterEntity } from "../../../entities/character.entity.js";
import type { SessionEntity } from "../../../entities/session.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

interface GetCharacterSessionsInput {
  limit: number;
  page: number;
  status?: "active" | "completed" | "crashed";
}

export class GetCharacterSessionsUseCase {
  constructor(
    private characterRepo: Repository<CharacterEntity>,
    private sessionRepo: Repository<SessionEntity>,
  ) {}

  async execute(
    userId: string,
    characterId: string,
    input: GetCharacterSessionsInput,
  ): Promise<{ sessions: SessionEntity[]; total: number; characterName: string }> {
    const character = await this.characterRepo.findOne({
      where: { id: characterId, userId },
    });

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const skip = (input.page - 1) * input.limit;

    const query = this.sessionRepo.createQueryBuilder("session")
      .where("session.characterId = :characterId", { characterId })
      .orderBy("session.startedAt", "DESC")
      .take(input.limit)
      .skip(skip);

    if (input.status) {
      query.andWhere("session.status = :status", { status: input.status });
    }

    const [sessions, total] = await query.getManyAndCount();

    return { sessions, total, characterName: character.name };
  }
}
