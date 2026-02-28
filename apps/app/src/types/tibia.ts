export interface TibiaCharacterInfo {
  name: string;
  world: string;
  level: number;
  vocation: string;
  sex: string;
  achievementPoints: number;
  guild: { name: string; rank: string } | null;
  lastLogin: string;
  accountStatus: string;
  deaths: Array<{
    time: string;
    level: number;
    killers: Array<{ name: string }>;
  }>;
  otherCharacters: Array<{
    name: string;
    world: string;
    status: string;
  }> | null;
}

export interface TibiaWorldInfo {
  name: string;
  playersOnline: number;
  onlineRecordPlayers: number;
  onlineRecordDate: string;
  pvpType: string;
  battlEyeProtected: boolean;
  battlEyeDate: string;
  transferType: string;
  worldQuestTitles: string[];
  onlinePlayers: Array<{
    name: string;
    level: number;
    vocation: string;
  }>;
}

export interface TibiaWorldsOverview {
  worlds: Array<{
    name: string;
    playersOnline: number;
    location: string;
    pvpType: string;
    battlEyeProtected: boolean;
    transferType: string;
  }>;
}

export interface BoostedCreatures {
  boostedBoss: { name: string; imageUrl: string };
  boostedCreature: { name: string; imageUrl: string };
}

export interface RashidLocation {
  city: string;
  x: number;
  y: number;
  z: number;
}

export interface KillStatistics {
  world: string;
  entries: Array<{
    race: string;
    lastDayPlayersKilled: number;
    lastDayKilled: number;
    lastWeekPlayersKilled: number;
    lastWeekKilled: number;
  }>;
}
