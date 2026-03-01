import type { Repository } from "typeorm";
import { In } from "typeorm";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";

export class BulkExtendLicensesUseCase {
  constructor(
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async execute(ids: string[], days: number): Promise<{ updated: number }> {
    const licenseKeys = await this.licenseKeyRepo.find({
      where: { id: In(ids) },
      relations: ["subscription"],
    });

    let updated = 0;

    for (const lk of licenseKeys) {
      if (!lk.subscription) continue;

      const sub = lk.subscription;
      const newEnd = new Date(sub.currentPeriodEnd);
      newEnd.setDate(newEnd.getDate() + days);
      sub.currentPeriodEnd = newEnd;

      await this.subscriptionRepo.save(sub);
      updated++;
    }

    return { updated };
  }
}
