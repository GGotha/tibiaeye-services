import type { Repository } from "typeorm";
import { UserEntity } from "../../../entities/user.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { PlanEntity } from "../../../entities/plan.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";
import type { AdminUserDetail } from "../schemas.js";

export class GetUserUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
    private readonly planRepo: Repository<PlanEntity>,
  ) {}

  async execute(userId: string): Promise<AdminUserDetail> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const [subscription, characters, licenseKeys] = await Promise.all([
      this.subscriptionRepo.findOne({
        where: { userId: user.id },
        relations: ["plan"],
      }),
      this.characterRepo.find({
        where: { userId: user.id },
        select: ["id", "name"],
      }),
      this.licenseKeyRepo.find({
        where: { userId: user.id },
        relations: ["subscription"],
      }),
    ]);

    // Get recent sessions through characters
    const recentSessions: AdminUserDetail["recentSessions"] = [];
    if (characters.length > 0) {
      const sessions = await this.sessionRepo.find({
        where: characters.map((c) => ({ characterId: c.id })),
        order: { startedAt: "DESC" },
        take: 10,
        relations: ["character"],
      });

      for (const session of sessions) {
        recentSessions.push({
          id: session.id,
          userId: user.id,
          characterName: session.character?.name || "Unknown",
          huntLocation: session.huntLocation,
          status: session.status as "active" | "completed" | "crashed",
          startedAt: session.startedAt.toISOString(),
          endedAt: session.endedAt?.toISOString() || null,
          stats: {
            totalKills: session.totalKills,
            totalExperience: Number(session.totalExperience),
            totalLootValue: session.totalLootValue,
            xpPerHour: session.xpPerHour,
          },
        });
      }
    }

    const sessionsCount = characters.length > 0
      ? await this.sessionRepo.count({
          where: characters.map((c) => ({ characterId: c.id })),
        })
      : 0;

    let subscriptionStatus: string = "none";
    if (subscription) {
      subscriptionStatus = subscription.status;
    }

    // Map subscription to the backoffice format
    const subscriptionData = subscription
      ? {
          id: subscription.id,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          planId: subscription.planId,
          plan: this.mapPlan(subscription.plan, 0),
          status: subscription.status as "active" | "cancelled" | "past_due" | "trialing",
          currentPeriodStart: subscription.currentPeriodStart.toISOString(),
          currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          createdAt: subscription.createdAt.toISOString(),
        }
      : null;

    // Map license keys
    const licenses = licenseKeys.map((lk) => {
      const expiresAt = lk.subscription?.currentPeriodEnd;
      const isExpired = expiresAt && new Date(expiresAt) < new Date();
      const computedStatus: "active" | "expired" | "revoked" =
        lk.status === "revoked" ? "revoked" : isExpired ? "expired" : "active";

      return {
        id: lk.id,
        userId: lk.userId,
        userEmail: user.email,
        userName: user.name,
        keyPrefix: lk.keyPrefix,
        status: computedStatus,
        expiresAt: expiresAt?.toISOString() || new Date().toISOString(),
        createdAt: lk.createdAt.toISOString(),
        lastUsedAt: lk.lastUsedAt?.toISOString() || null,
        activationsCount: lk.totalRequests,
        maxActivations: 1,
      };
    });

    // Map API keys (same license keys, different view)
    const apiKeys = licenseKeys.map((lk) => ({
      id: lk.id,
      userId: lk.userId,
      userEmail: user.email,
      name: subscription?.plan?.name || "License Key",
      keyPrefix: lk.keyPrefix,
      status: lk.status as "active" | "revoked",
      lastUsedAt: lk.lastUsedAt?.toISOString() || null,
      createdAt: lk.createdAt.toISOString(),
      requestsCount: lk.totalRequests,
    }));

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: null,
      subscriptionStatus: subscriptionStatus as "active" | "cancelled" | "past_due" | "none",
      charactersCount: characters.length,
      sessionsCount,
      subscription: subscriptionData,
      licenses,
      apiKeys,
      recentSessions,
    };
  }

  private mapPlan(plan: PlanEntity, subscribersCount: number) {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.features[0] || null,
      price: Number(plan.priceMonthly),
      interval: "month" as const,
      features: plan.features,
      maxCharacters: plan.maxCharacters,
      maxApiKeys: 1,
      isActive: plan.isActive,
      subscribersCount,
    };
  }
}
