import type { Repository } from "typeorm";
import { GameEventEntity } from "../../../entities/game-event.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { RouteEntity } from "../../../entities/route.entity.js";
import type { RouteSegmentAnalytics } from "../schemas.js";

interface SegmentKey {
  fromIndex: number;
  toIndex: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

export class GetRouteSegmentsUseCase {
  constructor(
    private readonly gameEventRepo: Repository<GameEventEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
    private readonly routeRepo: Repository<RouteEntity>,
  ) {}

  async execute(userId: string, routeId: string): Promise<RouteSegmentAnalytics> {
    const empty: RouteSegmentAnalytics = {
      segments: [],
      totalAvgLoopSeconds: 0,
      sessionCount: 0,
      globalAvgSegmentSeconds: 0,
    };

    // Verify route ownership
    const route = await this.routeRepo.findOne({ where: { id: routeId } });
    if (!route || route.userId !== userId) {
      return empty;
    }

    // Get user's characters
    const characters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });
    if (characters.length === 0) return empty;

    const characterIds = characters.map((c) => c.id);

    // Find sessions linked to this route by routeId first
    let sessions = await this.sessionRepo
      .createQueryBuilder("s")
      .where("s.routeId = :routeId", { routeId })
      .andWhere("s.characterId IN (:...characterIds)", { characterIds })
      .select(["s.id"])
      .getMany();

    // Fallback: match by huntLocation = route name (bot sends filename as huntLocation)
    if (sessions.length === 0) {
      sessions = await this.sessionRepo
        .createQueryBuilder("s")
        .where("LOWER(s.huntLocation) = LOWER(:routeName)", { routeName: route.name })
        .andWhere("s.characterId IN (:...characterIds)", { characterIds })
        .select(["s.id"])
        .getMany();
    }

    if (sessions.length === 0) return empty;

    const sessionIds = sessions.map((s) => s.id);

    // Get all waypoint_reached events for these sessions
    const events = await this.gameEventRepo
      .createQueryBuilder("e")
      .where("e.type = :type", { type: "waypoint_reached" })
      .andWhere("e.sessionId IN (:...sessionIds)", { sessionIds })
      .orderBy("e.sessionId", "ASC")
      .addOrderBy("e.createdAt", "ASC")
      .getMany();

    if (events.length < 2) return empty;

    // Group by session and compute segment diffs
    const segmentTimings = new Map<string, number[]>();
    let currentSessionId = "";
    let prevEvent: GameEventEntity | null = null;

    for (const event of events) {
      if (event.sessionId !== currentSessionId) {
        currentSessionId = event.sessionId;
        prevEvent = event;
        continue;
      }

      if (!prevEvent) {
        prevEvent = event;
        continue;
      }

      const prevData = prevEvent.data as Record<string, unknown> | null;
      const currData = event.data as Record<string, unknown> | null;
      if (!prevData || !currData) {
        prevEvent = event;
        continue;
      }

      const fromIndex = Number(prevData.waypointIndex ?? 0);
      const toIndex = Number(currData.waypointIndex ?? 0);
      const diffSeconds =
        (event.createdAt.getTime() - prevEvent.createdAt.getTime()) / 1000;

      // Skip unreasonable segments (> 10 min likely means AFK/disconnect)
      if (diffSeconds > 600 || diffSeconds <= 0) {
        prevEvent = event;
        continue;
      }

      const key = `${fromIndex}->${toIndex}`;
      const timings = segmentTimings.get(key) ?? [];
      timings.push(diffSeconds);
      segmentTimings.set(key, timings);

      prevEvent = event;
    }

    if (segmentTimings.size === 0) return empty;

    // Compute per-segment statistics
    let totalAvg = 0;
    let totalSegments = 0;
    const allAvgs: number[] = [];

    const segments = Array.from(segmentTimings.entries()).map(([key, timings]) => {
      const [fromStr, toStr] = key.split("->");
      const fromIndex = Number(fromStr);
      const toIndex = Number(toStr);

      timings.sort((a, b) => a - b);
      const sum = timings.reduce((a, b) => a + b, 0);
      const avg = sum / timings.length;
      const median = percentile(timings, 50);
      const p95 = percentile(timings, 95);

      totalAvg += avg;
      totalSegments++;
      allAvgs.push(avg);

      return {
        fromIndex,
        toIndex,
        avgSeconds: Math.round(avg * 10) / 10,
        medianSeconds: Math.round(median * 10) / 10,
        p95Seconds: Math.round(p95 * 10) / 10,
        minSeconds: Math.round(timings[0] * 10) / 10,
        maxSeconds: Math.round(timings[timings.length - 1] * 10) / 10,
        sampleCount: timings.length,
        isSlow: false,
        isHighVariance: false,
      };
    });

    const globalAvg = totalSegments > 0 ? totalAvg / totalSegments : 0;

    // Flag slow and high-variance segments
    for (const seg of segments) {
      seg.isSlow = seg.avgSeconds > globalAvg * 2;
      seg.isHighVariance = seg.p95Seconds > seg.avgSeconds * 3;
    }

    // Sort by fromIndex for consistent display
    segments.sort((a, b) => a.fromIndex - b.fromIndex || a.toIndex - b.toIndex);

    return {
      segments,
      totalAvgLoopSeconds: Math.round(totalAvg * 10) / 10,
      sessionCount: sessions.length,
      globalAvgSegmentSeconds: Math.round(globalAvg * 10) / 10,
    };
  }
}
