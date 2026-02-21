import type { Repository } from "typeorm";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { Character } from "../schemas.js";

export class ListCharactersUseCase {
  constructor(private readonly characterRepo: Repository<CharacterEntity>) {}

  async execute(userId: string): Promise<Character[]> {
    const characters = await this.characterRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    return characters.map((char) => ({
      id: char.id,
      userId: char.userId,
      name: char.name,
      world: char.world,
      level: char.level,
      vocation: char.vocation,
      isActive: char.isActive,
      createdAt: char.createdAt.toISOString(),
      updatedAt: char.updatedAt.toISOString(),
    }));
  }
}
