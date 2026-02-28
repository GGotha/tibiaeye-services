import { CacheTTL, tibiaApiProvider } from "../tibia-api.provider.js";

interface RashidSchedule {
  city: string;
  x: number;
  y: number;
  z: number;
}

const RASHID_SCHEDULE: RashidSchedule[] = [
  { city: "Carlin", x: 32360, y: 31782, z: 6 },
  { city: "Svargrond", x: 32212, y: 31132, z: 7 },
  { city: "Liberty Bay", x: 32317, y: 32826, z: 7 },
  { city: "Port Hope", x: 32594, y: 32745, z: 7 },
  { city: "Ankrahmun", x: 33092, y: 32884, z: 6 },
  { city: "Darashia", x: 33213, y: 32454, z: 1 },
  { city: "Edron", x: 33175, y: 31764, z: 3 },
];

interface RashidLocation {
  city: string;
  x: number;
  y: number;
  z: number;
}

export class GetRashidLocationUseCase {
  async execute(): Promise<RashidLocation> {
    try {
      const response = await tibiaApiProvider.fetchWithCache<{
        city: string;
        x: number;
        y: number;
        z: number;
      }>("https://api.tibiadata.com/v4/creatures", CacheTTL.LONG);

      if (response.city) {
        return response;
      }
    } catch {
      // Fallback to local calculation
    }

    return this.calculateFromSchedule();
  }

  private calculateFromSchedule(): RashidLocation {
    const now = new Date();
    const utcDay = now.getUTCDay();
    // Rashid follows a weekly schedule starting Monday (1) through Sunday (0)
    // Monday = 0 index in our array
    const scheduleIndex = utcDay === 0 ? 6 : utcDay - 1;
    return RASHID_SCHEDULE[scheduleIndex];
  }
}
