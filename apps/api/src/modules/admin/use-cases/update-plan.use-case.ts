import type { Repository } from "typeorm";
import { PlanEntity } from "../../../entities/plan.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

interface UpdatePlanInput {
  name?: string;
  description?: string | null;
  price?: number;
  interval?: "month" | "year";
  features?: string[];
  maxCharacters?: number;
  maxApiKeys?: number;
  isActive?: boolean;
}

export class UpdatePlanUseCase {
  constructor(
    private readonly planRepo: Repository<PlanEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async execute(planId: string, input: UpdatePlanInput) {
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundError("Plan not found");

    if (input.name !== undefined) plan.name = input.name;
    if (input.price !== undefined) {
      plan.priceMonthly = input.price;
      plan.priceYearly = input.price * 10;
    }
    if (input.features !== undefined) plan.features = input.features;
    if (input.maxCharacters !== undefined) plan.maxCharacters = input.maxCharacters;
    if (input.isActive !== undefined) plan.isActive = input.isActive;

    await this.planRepo.save(plan);

    const subscribersCount = await this.subscriptionRepo.count({
      where: { planId: plan.id, status: "active" },
    });

    return {
      id: plan.id,
      name: plan.name,
      description: input.description !== undefined ? input.description : (plan.features[0] || null),
      price: Number(plan.priceMonthly),
      interval: (input.interval || "month") as "month" | "year",
      features: plan.features,
      maxCharacters: plan.maxCharacters,
      maxApiKeys: input.maxApiKeys || 1,
      isActive: plan.isActive,
      subscribersCount,
    };
  }
}
