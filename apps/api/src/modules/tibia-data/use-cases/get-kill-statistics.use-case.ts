import { tibiaApiProvider, CacheTTL } from "../tibia-api.provider.js";

interface TibiaDataKillStatisticsResponse {
  killstatistics: {
    world: string;
    entries: Array<{
      race: string;
      last_day_players_killed: number;
      last_day_killed: number;
      last_week_players_killed: number;
      last_week_killed: number;
    }>;
  };
}

interface KillStatisticsEntry {
  race: string;
  lastDayPlayersKilled: number;
  lastDayKilled: number;
  lastWeekPlayersKilled: number;
  lastWeekKilled: number;
}

interface KillStatistics {
  world: string;
  entries: KillStatisticsEntry[];
}

export class GetKillStatisticsUseCase {
  async execute(world: string): Promise<KillStatistics> {
    const encodedWorld = encodeURIComponent(world);
    const url = `https://api.tibiadata.com/v4/killstatistics/${encodedWorld}`;
    const response = await tibiaApiProvider.fetchWithCache<TibiaDataKillStatisticsResponse>(
      url,
      CacheTTL.LONG,
    );

    const entries = (response.killstatistics.entries ?? []).map((entry) => ({
      race: entry.race,
      lastDayPlayersKilled: entry.last_day_players_killed,
      lastDayKilled: entry.last_day_killed,
      lastWeekPlayersKilled: entry.last_week_players_killed,
      lastWeekKilled: entry.last_week_killed,
    }));

    return {
      world: response.killstatistics.world,
      entries,
    };
  }
}
