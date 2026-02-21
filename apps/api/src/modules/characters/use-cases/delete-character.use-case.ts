import type { Repository } from "typeorm";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { NotFoundError, ForbiddenError } from "../../../shared/errors/index.js";

export class DeleteCharacterUseCase {
  constructor(private readonly characterRepo: Repository<CharacterEntity>) {}

  async execute(userId: string, characterId: string): Promise<{ message: string }> {
    const character = await this.characterRepo.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    if (character.userId !== userId) {
      throw new ForbiddenError("You do not own this character");
    }

    await this.characterRepo.remove(character);

    return { message: "Character deleted successfully" };
  }
}
