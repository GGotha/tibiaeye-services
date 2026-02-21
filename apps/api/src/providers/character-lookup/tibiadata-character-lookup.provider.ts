import type {
  CharacterLookupProvider,
  CharacterLookupResult,
} from "./character-lookup.provider.js";

interface TibiaDataCharacterResponse {
  character: {
    character: {
      name: string;
      world: string;
      level: number;
      vocation: string;
    };
  };
  information: {
    status: {
      http_code: number;
    };
  };
}

export class TibiaDataCharacterLookupProvider implements CharacterLookupProvider {
  private readonly baseUrl = "https://api.tibiadata.com/v4";

  async lookup(name: string): Promise<CharacterLookupResult | null> {
    const encodedName = encodeURIComponent(name);
    const response = await fetch(`${this.baseUrl}/character/${encodedName}`);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as TibiaDataCharacterResponse;

    if (data.information.status.http_code !== 200) {
      return null;
    }

    const character = data.character.character;

    // TibiaData returns an empty name when character doesn't exist
    if (!character.name) {
      return null;
    }

    return {
      name: character.name,
      world: character.world,
      level: character.level,
      vocation: character.vocation,
    };
  }
}
