import { tibiaApiProvider, CacheTTL } from "../tibia-api.provider.js";

interface TibiaDataWorldsResponse {
  worlds: {
    regular_worlds: Array<{
      name: string;
      players_online: number;
      location: string;
      pvp_type: string;
      battleye_protected: boolean;
      transfer_type: string;
    }>;
  };
}

interface WorldSummary {
  name: string;
  playersOnline: number;
  location: string;
  pvpType: string;
  battlEyeProtected: boolean;
  transferType: string;
}

interface WorldsOverview {
  worlds: WorldSummary[];
}

export class GetWorldsOverviewUseCase {
  async execute(): Promise<WorldsOverview> {
    const url = "https://api.tibiadata.com/v4/worlds";
    const response = await tibiaApiProvider.fetchWithCache<TibiaDataWorldsResponse>(
      url,
      CacheTTL.SHORT,
    );

    const worlds = (response.worlds.regular_worlds ?? []).map((w) => ({
      name: w.name,
      playersOnline: w.players_online,
      location: w.location,
      pvpType: w.pvp_type,
      battlEyeProtected: w.battleye_protected,
      transferType: w.transfer_type,
    }));

    return { worlds };
  }
}
