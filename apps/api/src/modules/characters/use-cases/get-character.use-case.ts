import type { Repository } from "typeorm";
import type { CharacterEntity } from "../../../entities/character.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

export class GetCharacterUseCase {
  constructor(private characterRepo: Repository<CharacterEntity>) {}

  async execute(userId: string, characterId: string): Promise<CharacterEntity> {
    const character = await this.characterRepo.findOne({
      where: { id: characterId, userId },
    });

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    return character;
  }
}
