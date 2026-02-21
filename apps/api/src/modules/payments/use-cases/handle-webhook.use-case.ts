import type { Repository } from "typeorm";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { PlanEntity } from "../../../entities/plan.entity.js";
import { UserEntity } from "../../../entities/user.entity.js";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { GenerateLicenseUseCase } from "../../license/use-cases/generate-license.use-case.js";
import { NotFoundError, AppError } from "../../../shared/errors/index.js";
import type { WebhookPayload, WebhookResponse } from "../schemas.js";

interface EmailService {
  sendLicenseKeyEmail(to: string, licenseKey: string, userName: string | null): Promise<void>;
}

export class HandleWebhookUseCase {
  constructor(
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    private readonly planRepo: Repository<PlanEntity>,
    private readonly userRepo: Repository<UserEntity>,
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
    private readonly emailService?: EmailService,
  ) {}

  async execute(payload: WebhookPayload): Promise<WebhookResponse> {
    switch (payload.event) {
      case "subscription.created":
        return this.handleSubscriptionCreated(payload);

      case "subscription.updated":
        return this.handleSubscriptionUpdated(payload);

      case "subscription.cancelled":
        return this.handleSubscriptionCancelled(payload);

      case "subscription.expired":
        return this.handleSubscriptionExpired(payload);

      case "payment.success":
      case "payment.failed":
        return { success: true, message: "Payment event acknowledged" };

      default:
        return { success: true, message: "Event ignored" };
    }
  }

  private async handleSubscriptionCreated(payload: WebhookPayload): Promise<WebhookResponse> {
    const userId = payload.data.metadata?.user_id;
    if (!userId) {
      throw new AppError("Missing user_id in webhook metadata", 400);
    }

    // Verify user exists
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get or create plan
    let plan = await this.planRepo.findOne({
      where: { id: payload.data.plan_id },
    });

    if (!plan) {
      // Use a default plan if not found (for testing)
      plan = await this.planRepo.findOne({
        where: { isActive: true },
        order: { priceMonthly: "ASC" },
      });
    }

    if (!plan) {
      throw new NotFoundError("No active plan available");
    }

    // Calculate period dates (30 days from now)
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    // Create or update subscription
    let subscription = await this.subscriptionRepo.findOne({ where: { userId } });

    if (subscription) {
      subscription.planId = plan.id;
      subscription.status = "active";
      subscription.externalId = payload.data.id;
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.cancelAtPeriodEnd = false;
    } else {
      subscription = this.subscriptionRepo.create({
        userId,
        planId: plan.id,
        status: "active",
        externalId: payload.data.id,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      });
    }

    await this.subscriptionRepo.save(subscription);

    // Generate license key
    const generateLicenseUseCase = new GenerateLicenseUseCase(this.licenseKeyRepo);
    const { licenseKey } = await generateLicenseUseCase.execute({
      userId,
      subscriptionId: subscription.id,
    });

    // Send email with license key
    if (this.emailService) {
      try {
        await this.emailService.sendLicenseKeyEmail(user.email, licenseKey, user.name);
      } catch (error) {
        console.error("Failed to send license key email:", error);
        // Don't fail the webhook, email is non-critical
      }
    } else {
      // Log for development
      console.log(`License key for ${user.email}: ${licenseKey}`);
    }

    return {
      success: true,
      message: "Subscription created and license key generated",
      licenseKey, // Return in response (will be shown once in dashboard)
    };
  }

  private async handleSubscriptionUpdated(payload: WebhookPayload): Promise<WebhookResponse> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { externalId: payload.data.id },
    });

    if (!subscription) {
      return { success: true, message: "Subscription not found, ignored" };
    }

    // Update based on status
    if (payload.data.status) {
      if (payload.data.status === "active") {
        subscription.status = "active";
      } else if (payload.data.status === "past_due") {
        subscription.status = "past_due";
      }
    }

    await this.subscriptionRepo.save(subscription);

    return { success: true, message: "Subscription updated" };
  }

  private async handleSubscriptionCancelled(payload: WebhookPayload): Promise<WebhookResponse> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { externalId: payload.data.id },
    });

    if (!subscription) {
      return { success: true, message: "Subscription not found, ignored" };
    }

    subscription.status = "cancelled";
    subscription.cancelAtPeriodEnd = true;
    await this.subscriptionRepo.save(subscription);

    // Revoke license keys
    await this.licenseKeyRepo.update(
      { subscriptionId: subscription.id, status: "active" },
      { status: "revoked" },
    );

    return { success: true, message: "Subscription cancelled and license revoked" };
  }

  private async handleSubscriptionExpired(payload: WebhookPayload): Promise<WebhookResponse> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { externalId: payload.data.id },
    });

    if (!subscription) {
      return { success: true, message: "Subscription not found, ignored" };
    }

    subscription.status = "cancelled";
    await this.subscriptionRepo.save(subscription);

    // Revoke license keys
    await this.licenseKeyRepo.update(
      { subscriptionId: subscription.id, status: "active" },
      { status: "revoked" },
    );

    return { success: true, message: "Subscription expired and license revoked" };
  }
}
