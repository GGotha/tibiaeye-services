import type { Repository } from "typeorm";
import { SessionEntity } from "../../../entities/session.entity.js";

function parsePeriodDays(period: string): number {
  switch (period) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "1y": return 365;
    default: return 30;
  }
}

export class GetUsageDataUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
  ) {}

  async execute(period: string) {
    const days = parsePeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all daily data in one query
    const rawData = await this.sessionRepo
      .createQueryBuilder("session")
      .innerJoin("session.character", "character")
      .select("DATE(session.startedAt)", "date")
      .addSelect("COUNT(*)", "sessions")
      .addSelect("COUNT(DISTINCT character.userId)", "uniqueUsers")
      .where("session.startedAt >= :start", { start: startDate })
      .groupBy("DATE(session.startedAt)")
      .orderBy("DATE(session.startedAt)", "ASC")
      .getRawMany();

    const dataMap = new Map<string, { sessions: number; uniqueUsers: number }>();
    for (const row of rawData) {
      const dateStr = row.date instanceof Date
        ? row.date.toISOString().split("T")[0]
        : String(row.date);
      dataMap.set(dateStr, {
        sessions: Number(row.sessions),
        uniqueUsers: Number(row.uniqueUsers),
      });
    }

    // Fill in all days
    const results: Array<{
      date: string;
      sessions: number;
      apiRequests: number;
      uniqueUsers: number;
    }> = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const entry = dataMap.get(dateStr);

      results.push({
        date: dateStr,
        sessions: entry?.sessions || 0,
        apiRequests: 0,
        uniqueUsers: entry?.uniqueUsers || 0,
      });
    }

    return results;
  }
}
