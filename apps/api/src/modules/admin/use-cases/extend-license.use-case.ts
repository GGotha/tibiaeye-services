import type { Repository } from "typeorm";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

export class ExtendLicenseUseCase {
  constructor(
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async execute(licenseId: string, days: number) {
    const lk = await this.licenseKeyRepo.findOne({
      where: { id: licenseId },
      relations: ["user", "subscription"],
    });

    if (!lk) throw new NotFoundError("License not found");
    if (!lk.subscription) throw new NotFoundError("Subscription not found for this license");

    const sub = lk.subscription;
    const newEnd = new Date(sub.currentPeriodEnd);
    newEnd.setDate(newEnd.getDate() + days);
    sub.currentPeriodEnd = newEnd;

    await this.subscriptionRepo.save(sub);

    const isExpired = newEnd < new Date();
    const computedStatus: "active" | "expired" | "revoked" =
      lk.status === "revoked" ? "revoked" : isExpired ? "expired" : "active";

    return {
      id: lk.id,
      userId: lk.userId,
      userEmail: lk.user?.email || "",
      userName: lk.user?.name || null,
      keyPrefix: lk.keyPrefix,
      status: computedStatus,
      expiresAt: newEnd.toISOString(),
      createdAt: lk.createdAt.toISOString(),
      lastUsedAt: lk.lastUsedAt?.toISOString() || null,
      activationsCount: lk.totalRequests,
      maxActivations: 1,
    };
  }
}
