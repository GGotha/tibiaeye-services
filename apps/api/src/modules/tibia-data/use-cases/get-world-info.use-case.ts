import { CacheTTL, tibiaApiProvider } from "../tibia-api.provider.js";

interface TibiaDataWorldResponse {
  world: {
    name: string;
    status: string;
    players_online: number;
    record_players: number;
    record_date: string;
    pvp_type: string;
    battleye_protected: boolean;
    battleye_date: string;
    transfer_type: string;
    world_quest_titles: string[];
    online_players: Array<{
      name: string;
      level: number;
      vocation: string;
    }>;
  };
}

interface WorldInfo {
  name: string;
  playersOnline: number;
  onlineRecordPlayers: number;
  onlineRecordDate: string;
  pvpType: string;
  battlEyeProtected: boolean;
  battlEyeDate: string;
  transferType: string;
  worldQuestTitles: string[];
  onlinePlayers: Array<{ name: string; level: number; vocation: string }>;
}

export class GetWorldInfoUseCase {
  async execute(name: string): Promise<WorldInfo> {
    const encodedName = encodeURIComponent(name);
    const url = `https://api.tibiadata.com/v4/world/${encodedName}`;
    const response = await tibiaApiProvider.fetchWithCache<TibiaDataWorldResponse>(
      url,
      CacheTTL.SHORT,
    );

    const world = response.world;

    return {
      name: world.name,
      playersOnline: world.players_online,
      onlineRecordPlayers: world.record_players,
      onlineRecordDate: world.record_date,
      pvpType: world.pvp_type,
      battlEyeProtected: world.battleye_protected,
      battlEyeDate: world.battleye_date,
      transferType: world.transfer_type,
      worldQuestTitles: world.world_quest_titles ?? [],
      onlinePlayers: world.online_players ?? [],
    };
  }
}
