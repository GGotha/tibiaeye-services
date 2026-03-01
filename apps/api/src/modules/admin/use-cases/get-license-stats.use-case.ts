import type { Repository } from "typeorm";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { Between } from "typeorm";

export class GetLicenseStatsUseCase {
  constructor(
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async execute() {
    const now = new Date();
    const oneWeekFromNow = new Date(now);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const [total, revoked] = await Promise.all([
      this.licenseKeyRepo.count(),
      this.licenseKeyRepo.count({ where: { status: "revoked" } }),
    ]);

    // Active: key is active AND subscription not expired
    const active = await this.licenseKeyRepo
      .createQueryBuilder("lk")
      .innerJoin("lk.subscription", "sub")
      .where("lk.status = :status", { status: "active" })
      .andWhere("sub.currentPeriodEnd >= NOW()")
      .getCount();

    // Expired: key is active but subscription is expired
    const expired = await this.licenseKeyRepo
      .createQueryBuilder("lk")
      .innerJoin("lk.subscription", "sub")
      .where("lk.status = :status", { status: "active" })
      .andWhere("sub.currentPeriodEnd < NOW()")
      .getCount();

    // Expiring this week
    const expiringThisWeek = await this.subscriptionRepo.count({
      where: {
        status: "active",
        currentPeriodEnd: Between(now, oneWeekFromNow),
      },
    });

    return {
      total,
      active,
      expired,
      revoked,
      expiringThisWeek,
    };
  }
}
