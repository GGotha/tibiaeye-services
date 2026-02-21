import type { Repository } from "typeorm";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { CharacterLookupProvider } from "../../../providers/character-lookup/character-lookup.provider.js";
import { ConflictError, NotFoundError } from "../../../shared/errors/index.js";
import type { CreateCharacterInput, Character } from "../schemas.js";

export class CreateCharacterUseCase {
  constructor(
    private readonly characterRepo: Repository<CharacterEntity>,
    private readonly characterLookup: CharacterLookupProvider,
  ) {}

  async execute(userId: string, input: CreateCharacterInput): Promise<Character> {
    const lookupResult = await this.characterLookup.lookup(input.name);

    if (!lookupResult) {
      throw new NotFoundError("Character not found in Tibia");
    }

    // Check if character with same name+world already exists for this user
    const existing = await this.characterRepo.findOne({
      where: { name: lookupResult.name, world: lookupResult.world },
    });

    if (existing) {
      throw new ConflictError("Character already exists");
    }

    const character = this.characterRepo.create({
      userId,
      name: lookupResult.name,
      world: lookupResult.world,
      level: lookupResult.level,
      vocation: lookupResult.vocation,
      isActive: true,
    });

    await this.characterRepo.save(character);

    return {
      id: character.id,
      userId: character.userId,
      name: character.name,
      world: character.world,
      level: character.level,
      vocation: character.vocation,
      isActive: character.isActive,
      createdAt: character.createdAt.toISOString(),
      updatedAt: character.updatedAt.toISOString(),
    };
  }
}
