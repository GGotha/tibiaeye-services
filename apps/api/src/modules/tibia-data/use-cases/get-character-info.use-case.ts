import { CacheTTL, tibiaApiProvider } from "../tibia-api.provider.js";

interface TibiaDataGuild {
  name?: string;
  rank?: string;
}

interface TibiaDataCharacterResponse {
  character: {
    character: {
      name: string;
      world: string;
      level: number;
      vocation: string;
      sex: string;
      achievement_points: number;
      last_login: string;
      account_status: string;
      guild?: TibiaDataGuild;
    };
    deaths?: Array<{
      time: string;
      level: number;
      killers: Array<{ name: string }>;
    }>;
    other_characters?: Array<{
      name: string;
      world: string;
      status: string;
    }>;
  };
}

interface CharacterInfo {
  name: string;
  world: string;
  level: number;
  vocation: string;
  sex: string;
  achievementPoints: number;
  guild: { name: string; rank: string } | null;
  lastLogin: string;
  accountStatus: string;
  deaths: Array<{ time: string; level: number; killers: Array<{ name: string }> }>;
  otherCharacters: Array<{ name: string; world: string; status: string }> | null;
}

export class GetCharacterInfoUseCase {
  async execute(name: string): Promise<CharacterInfo> {
    const encodedName = encodeURIComponent(name);
    const url = `https://api.tibiadata.com/v4/character/${encodedName}`;
    const response = await tibiaApiProvider.fetchWithCache<TibiaDataCharacterResponse>(
      url,
      CacheTTL.SHORT,
    );

    const char = response.character.character;
    const hasGuild = char.guild?.name && char.guild.name.length > 0;
    const guild = hasGuild ? { name: char.guild!.name!, rank: char.guild!.rank ?? "" } : null;
    const deaths = response.character.deaths ?? [];
    const otherCharacters = response.character.other_characters ?? null;

    return {
      name: char.name,
      world: char.world,
      level: char.level,
      vocation: char.vocation,
      sex: char.sex,
      achievementPoints: char.achievement_points,
      guild,
      lastLogin: char.last_login,
      accountStatus: char.account_status,
      deaths,
      otherCharacters,
    };
  }
}
