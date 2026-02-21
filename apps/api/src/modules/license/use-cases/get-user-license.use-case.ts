import type { Repository } from "typeorm";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import type { UserLicense } from "../schemas.js";

export class GetUserLicenseUseCase {
  constructor(
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async execute(userId: string): Promise<UserLicense | null> {
    // Get user's active subscription
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId, status: "active" },
    });

    if (!subscription) {
      return null;
    }

    // Get license key for this subscription
    const licenseKey = await this.licenseKeyRepo.findOne({
      where: { subscriptionId: subscription.id, status: "active" },
    });

    if (!licenseKey) {
      return null;
    }

    // Calculate days remaining
    const now = new Date();
    const diffMs = subscription.currentPeriodEnd.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return {
      id: licenseKey.id,
      status: licenseKey.status,
      keyPrefix: licenseKey.keyPrefix,
      createdAt: licenseKey.createdAt.toISOString(),
      lastUsedAt: licenseKey.lastUsedAt?.toISOString() || null,
      totalRequests: licenseKey.totalRequests,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        daysRemaining,
      },
    };
  }
}
