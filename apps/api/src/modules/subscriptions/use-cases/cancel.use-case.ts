import type { Repository } from "typeorm";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { NotFoundError, AppError } from "../../../shared/errors/index.js";

export class CancelSubscriptionUseCase {
  constructor(private readonly subscriptionRepo: Repository<SubscriptionEntity>) {}

  async execute(userId: string): Promise<{ message: string }> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundError("No subscription found");
    }

    if (subscription.status === "cancelled") {
      throw new AppError("Subscription is already cancelled", 400);
    }

    // Mark to cancel at period end (don't cancel immediately)
    subscription.cancelAtPeriodEnd = true;
    await this.subscriptionRepo.save(subscription);

    return {
      message: `Subscription will be cancelled at the end of the current period (${subscription.currentPeriodEnd.toISOString()})`,
    };
  }
}
