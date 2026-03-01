import type { Repository } from "typeorm";
import { PlanEntity } from "../../../entities/plan.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";

export class ListPlansUseCase {
  constructor(
    private readonly planRepo: Repository<PlanEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async execute() {
    const plans = await this.planRepo.find({ order: { createdAt: "ASC" } });

    const results = [];
    for (const plan of plans) {
      const subscribersCount = await this.subscriptionRepo.count({
        where: { planId: plan.id, status: "active" },
      });

      results.push({
        id: plan.id,
        name: plan.name,
        description: plan.features[0] || null,
        price: Number(plan.priceMonthly),
        interval: "month" as const,
        features: plan.features,
        maxCharacters: plan.maxCharacters,
        maxApiKeys: 1,
        isActive: plan.isActive,
        subscribersCount,
      });
    }

    return results;
  }
}
