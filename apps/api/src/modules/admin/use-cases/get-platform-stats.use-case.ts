import type { Repository } from "typeorm";
import { Between, MoreThan } from "typeorm";
import { UserEntity } from "../../../entities/user.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { SessionEntity, SessionStatus } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { PlanEntity } from "../../../entities/plan.entity.js";
import type { PlatformStats } from "../schemas.js";

export class GetPlatformStatsUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
    private readonly planRepo: Repository<PlanEntity>,
  ) {}

  async execute(): Promise<PlatformStats> {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const oneWeekFromNow = new Date(now);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const [
      totalUsers,
      newThisWeek,
      newThisMonth,
      prevMonthUsers,
      activeSubscriptions,
      activeTrials,
      cancelledLast30d,
      totalLicenseKeys,
      activeLicenseKeys,
      activeSessions,
      sessionsToday,
    ] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { createdAt: MoreThan(sevenDaysAgo) } }),
      this.userRepo.count({ where: { createdAt: MoreThan(thirtyDaysAgo) } }),
      this.userRepo.count({
        where: { createdAt: Between(sixtyDaysAgo, thirtyDaysAgo) },
      }),
      this.subscriptionRepo.count({ where: { status: "active" } }),
      this.subscriptionRepo.count({ where: { status: "trialing" } }),
      this.subscriptionRepo.count({
        where: { status: "cancelled" },
      }),
      this.licenseKeyRepo.count(),
      this.licenseKeyRepo.count({ where: { status: "active" } }),
      this.sessionRepo.count({ where: { status: SessionStatus.ACTIVE } }),
      this.sessionRepo.count({
        where: { startedAt: MoreThan(todayStart) },
      }),
    ]);

    // MRR: sum priceMonthly of plans with active subscriptions
    const mrrResult = await this.subscriptionRepo
      .createQueryBuilder("sub")
      .innerJoin("sub.plan", "plan")
      .select("COALESCE(SUM(plan.priceMonthly), 0)", "mrr")
      .where("sub.status = :status", { status: "active" })
      .getRawOne();
    const mrr = Number(mrrResult?.mrr || 0);

    // Expiring this week: subscriptions ending within 7 days
    const expiringThisWeek = await this.subscriptionRepo.count({
      where: {
        status: "active",
        currentPeriodEnd: Between(now, oneWeekFromNow),
      },
    });

    // Avg session duration (completed sessions in last 7 days)
    const avgDurationResult = await this.sessionRepo
      .createQueryBuilder("session")
      .select(
        "COALESCE(AVG(EXTRACT(EPOCH FROM (session.endedAt - session.startedAt))), 0)",
        "avg",
      )
      .where("session.status = :status", { status: SessionStatus.COMPLETED })
      .andWhere("session.endedAt IS NOT NULL")
      .andWhere("session.startedAt > :since", { since: sevenDaysAgo })
      .getRawOne();
    const avgSessionDuration = Math.round(Number(avgDurationResult?.avg || 0));

    // Growth rate
    const growthRate =
      prevMonthUsers > 0
        ? Math.round(((newThisMonth - prevMonthUsers) / prevMonthUsers) * 100 * 10) / 10
        : 0;

    // Churn rate
    const totalSubsForChurn = activeSubscriptions + cancelledLast30d;
    const churnRate =
      totalSubsForChurn > 0
        ? Math.round((cancelledLast30d / totalSubsForChurn) * 100 * 10) / 10
        : 0;

    return {
      users: {
        total: totalUsers,
        activeToday: activeSessions,
        newThisWeek,
        newThisMonth,
        growthRate,
      },
      subscriptions: {
        total: activeSubscriptions,
        mrr,
        mrrGrowth: 0,
        churnRate,
        activeTrials,
      },
      licenses: {
        total: totalLicenseKeys,
        active: activeLicenseKeys,
        expiringThisWeek,
      },
      usage: {
        sessionsToday,
        apiRequestsToday: 0,
        avgSessionDuration,
        peakConcurrentBots: activeSessions,
      },
    };
  }
}
