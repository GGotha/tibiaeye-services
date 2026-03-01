import type { Repository } from "typeorm";
import { PlanEntity } from "../../../entities/plan.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

export class DeactivatePlanUseCase {
  constructor(
    private readonly planRepo: Repository<PlanEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async execute(planId: string) {
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundError("Plan not found");

    plan.isActive = false;
    await this.planRepo.save(plan);

    const subscribersCount = await this.subscriptionRepo.count({
      where: { planId: plan.id, status: "active" },
    });

    return {
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
    };
  }
}
