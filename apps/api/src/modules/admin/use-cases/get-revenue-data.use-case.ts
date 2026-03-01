import type { Repository } from "typeorm";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";

function parsePeriodDays(period: string): number {
  switch (period) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "1y": return 365;
    default: return 30;
  }
}

export class GetRevenueDataUseCase {
  constructor(
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async execute(period: string) {
    const days = parsePeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const results: Array<{
      date: string;
      mrr: number;
      newSubscriptions: number;
      churn: number;
    }> = [];

    // Generate daily data points
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // MRR for this day: active subscriptions * plan price
      const mrrResult = await this.subscriptionRepo
        .createQueryBuilder("sub")
        .innerJoin("sub.plan", "plan")
        .select("COALESCE(SUM(plan.priceMonthly), 0)", "mrr")
        .where("sub.status IN (:...statuses)", { statuses: ["active", "trialing"] })
        .andWhere("sub.createdAt <= :date", { date: nextDate })
        .andWhere("sub.currentPeriodEnd >= :date", { date })
        .getRawOne();

      // New subscriptions on this day
      const newSubs = await this.subscriptionRepo
        .createQueryBuilder("sub")
        .where("sub.createdAt >= :start", { start: date })
        .andWhere("sub.createdAt < :end", { end: nextDate })
        .getCount();

      // Churn: cancelled on this day (approximate)
      const churn = await this.subscriptionRepo
        .createQueryBuilder("sub")
        .where("sub.status = :status", { status: "cancelled" })
        .andWhere("sub.currentPeriodEnd >= :start", { start: date })
        .andWhere("sub.currentPeriodEnd < :end", { end: nextDate })
        .getCount();

      results.push({
        date: dateStr,
        mrr: Number(mrrResult?.mrr || 0),
        newSubscriptions: newSubs,
        churn,
      });
    }

    return results;
  }
}
