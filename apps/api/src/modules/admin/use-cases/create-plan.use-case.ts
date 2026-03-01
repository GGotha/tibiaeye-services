import type { Repository } from "typeorm";
import { PlanEntity } from "../../../entities/plan.entity.js";

interface CreatePlanInput {
  name: string;
  description?: string | null;
  price: number;
  interval?: "month" | "year";
  features?: string[];
  maxCharacters?: number;
  maxApiKeys?: number;
  isActive?: boolean;
}

export class CreatePlanUseCase {
  constructor(
    private readonly planRepo: Repository<PlanEntity>,
  ) {}

  async execute(input: CreatePlanInput) {
    const plan = this.planRepo.create({
      name: input.name,
      priceMonthly: input.price,
      priceYearly: input.price * 10,
      features: input.features || [],
      maxCharacters: input.maxCharacters || 1,
      historyDays: 30,
      apiRequestsPerDay: 1000,
      isActive: input.isActive ?? true,
    });

    await this.planRepo.save(plan);

    return {
      id: plan.id,
      name: plan.name,
      description: input.description || plan.features[0] || null,
      price: Number(plan.priceMonthly),
      interval: (input.interval || "month") as "month" | "year",
      features: plan.features,
      maxCharacters: plan.maxCharacters,
      maxApiKeys: input.maxApiKeys || 1,
      isActive: plan.isActive,
      subscribersCount: 0,
    };
  }
}
