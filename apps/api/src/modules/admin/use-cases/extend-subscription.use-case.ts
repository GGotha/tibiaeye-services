import type { Repository } from "typeorm";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

export class ExtendSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async execute(subscriptionId: string, days: number) {
    const sub = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId },
      relations: ["user", "plan"],
    });

    if (!sub) throw new NotFoundError("Subscription not found");

    const newEnd = new Date(sub.currentPeriodEnd);
    newEnd.setDate(newEnd.getDate() + days);
    sub.currentPeriodEnd = newEnd;

    await this.subscriptionRepo.save(sub);

    return {
      id: sub.id,
      userId: sub.userId,
      userEmail: sub.user?.email || "",
      userName: sub.user?.name || null,
      planId: sub.planId,
      plan: {
        id: sub.plan.id,
        name: sub.plan.name,
        description: sub.plan.features[0] || null,
        price: Number(sub.plan.priceMonthly),
        interval: "month" as const,
        features: sub.plan.features,
        maxCharacters: sub.plan.maxCharacters,
        maxApiKeys: 1,
        isActive: sub.plan.isActive,
        subscribersCount: 0,
      },
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart.toISOString(),
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      createdAt: sub.createdAt.toISOString(),
    };
  }
}
