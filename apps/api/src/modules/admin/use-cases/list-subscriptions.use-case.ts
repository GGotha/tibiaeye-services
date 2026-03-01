import type { Repository } from "typeorm";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";

interface ListSubscriptionsQuery {
  page: number;
  limit: number;
  status?: string;
  planId?: string;
}

export class ListSubscriptionsUseCase {
  constructor(
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async execute(query: ListSubscriptionsQuery) {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.planId) where.planId = query.planId;

    const skip = (query.page - 1) * query.limit;

    const [subscriptions, total] = await this.subscriptionRepo.findAndCount({
      where,
      relations: ["user", "plan"],
      order: { createdAt: "DESC" },
      take: query.limit,
      skip,
    });

    // Count subscribers per plan for plan data
    const planSubCounts = new Map<string, number>();
    for (const sub of subscriptions) {
      const count = planSubCounts.get(sub.planId) || 0;
      planSubCounts.set(sub.planId, count + 1);
    }

    const data = subscriptions.map((sub) => ({
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
        subscribersCount: planSubCounts.get(sub.planId) || 0,
      },
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart.toISOString(),
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      createdAt: sub.createdAt.toISOString(),
    }));

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
