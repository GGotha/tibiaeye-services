import type { Repository } from "typeorm";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import type { Subscription } from "../schemas.js";

export class GetCurrentSubscriptionUseCase {
  constructor(private readonly subscriptionRepo: Repository<SubscriptionEntity>) {}

  async execute(userId: string): Promise<Subscription | null> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId },
      relations: ["plan"],
    });

    if (!subscription) {
      return null;
    }

    // Calculate days remaining
    const now = new Date();
    const diffMs = subscription.currentPeriodEnd.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return {
      id: subscription.id,
      userId: subscription.userId,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        priceMonthly: Number(subscription.plan.priceMonthly),
        priceYearly: Number(subscription.plan.priceYearly),
        maxCharacters: subscription.plan.maxCharacters,
        historyDays: subscription.plan.historyDays,
        apiRequestsPerDay: subscription.plan.apiRequestsPerDay,
        features: subscription.plan.features,
        isActive: subscription.plan.isActive,
      },
      status: subscription.status,
      externalId: subscription.externalId,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      daysRemaining,
      createdAt: subscription.createdAt.toISOString(),
    };
  }
}
