import type { Repository } from "typeorm";
import { PlanEntity } from "../../../entities/plan.entity.js";
import type { Plan } from "../schemas.js";

export class GetPlansUseCase {
  constructor(private readonly planRepo: Repository<PlanEntity>) {}

  async execute(): Promise<Plan[]> {
    const plans = await this.planRepo.find({
      where: { isActive: true },
      order: { priceMonthly: "ASC" },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      priceMonthly: Number(plan.priceMonthly),
      priceYearly: Number(plan.priceYearly),
      maxCharacters: plan.maxCharacters,
      historyDays: plan.historyDays,
      apiRequestsPerDay: plan.apiRequestsPerDay,
      features: plan.features,
      isActive: plan.isActive,
    }));
  }
}
