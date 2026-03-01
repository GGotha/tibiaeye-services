import type { Repository } from "typeorm";
import { UserEntity } from "../../../entities/user.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { PlanEntity } from "../../../entities/plan.entity.js";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { GenerateLicenseUseCase } from "../../license/use-cases/generate-license.use-case.js";
import { NotFoundError } from "../../../shared/errors/index.js";
import type { GivePlanInput } from "../schemas.js";

export class GivePlanUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    private readonly planRepo: Repository<PlanEntity>,
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
  ) {}

  async execute(
    userId: string,
    input: GivePlanInput,
  ): Promise<{ message: string; licenseKey: string; id: string; keyPrefix: string }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const plan = await this.planRepo.findOne({
      where: { id: input.planId },
    });

    if (!plan) {
      throw new NotFoundError("Plan not found");
    }

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + input.durationDays);

    // Create or update subscription
    let subscription = await this.subscriptionRepo.findOne({
      where: { userId },
    });

    if (subscription) {
      subscription.planId = plan.id;
      subscription.status = "active";
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.cancelAtPeriodEnd = false;
    } else {
      subscription = this.subscriptionRepo.create({
        userId,
        planId: plan.id,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      });
    }

    await this.subscriptionRepo.save(subscription);

    // Generate license key
    const generateLicenseUseCase = new GenerateLicenseUseCase(this.licenseKeyRepo);
    const result = await generateLicenseUseCase.execute({
      userId,
      subscriptionId: subscription.id,
    });

    return {
      message: `Gave ${plan.name} plan to user for ${input.durationDays} days`,
      licenseKey: result.licenseKey,
      id: result.id,
      keyPrefix: result.keyPrefix,
    };
  }
}
