import type { Repository } from "typeorm";
import { SessionEntity } from "../../../entities/session.entity.js";
import { GameEventEntity } from "../../../entities/game-event.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { ProfitData, ProfitQuery } from "../schemas.js";

export class GetProfitUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly gameEventRepo: Repository<GameEventEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, query: ProfitQuery): Promise<ProfitData> {
    const userCharacters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });
    const characterIds = userCharacters.map((c) => c.id);

    if (characterIds.length === 0) {
      return { totalRevenue: 0, totalCost: 0, netProfit: 0, profitPerHour: 0, sessions: [] };
    }

    const qb = this.sessionRepo.createQueryBuilder("s")
      .where("s.characterId IN (:...characterIds)", { characterIds })
      .andWhere("s.status = :status", { status: "completed" });

    if (query.sessionId) {
      qb.andWhere("s.id = :sessionId", { sessionId: query.sessionId });
    }
    if (query.characterId) {
      qb.andWhere("s.characterId = :characterId", { characterId: query.characterId });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - query.days);
    qb.andWhere("s.startedAt >= :cutoff", { cutoff });

    qb.orderBy("s.startedAt", "DESC");

    const sessions = await qb.getMany();

    const sessionIds = sessions.map((s) => s.id);
    const refillCosts = new Map<string, number>();

    if (sessionIds.length > 0) {
      const refills = await this.gameEventRepo
        .createQueryBuilder("e")
        .where("e.sessionId IN (:...sessionIds)", { sessionIds })
        .andWhere("e.type = :type", { type: "refill" })
        .getMany();

      for (const refill of refills) {
        const cost = (refill.data as { goldSpent?: number })?.goldSpent ?? 0;
        const current = refillCosts.get(refill.sessionId) ?? 0;
        refillCosts.set(refill.sessionId, current + cost);
      }
    }

    let totalRevenue = 0;
    let totalCost = 0;
    let totalDuration = 0;

    const sessionData = sessions.map((s) => {
      const suppliesCost = refillCosts.get(s.id) ?? 0;
      const lootValue = s.totalLootValue;
      const net = lootValue - suppliesCost;

      totalRevenue += lootValue;
      totalCost += suppliesCost;
      totalDuration += s.duration;

      return {
        sessionId: s.id,
        huntLocation: s.huntLocation,
        duration: s.duration,
        lootValue,
        suppliesCost,
        netProfit: net,
        startedAt: s.startedAt.toISOString(),
      };
    });

    const netProfit = totalRevenue - totalCost;
    const hours = totalDuration / 3600;
    const profitPerHour = hours > 0 ? Math.round(netProfit / hours) : 0;

    return {
      totalRevenue,
      totalCost,
      netProfit,
      profitPerHour,
      sessions: sessionData,
    };
  }
}
