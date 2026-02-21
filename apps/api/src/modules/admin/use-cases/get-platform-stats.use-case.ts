import type { Repository } from "typeorm";
import { MoreThan } from "typeorm";
import { UserEntity } from "../../../entities/user.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { SessionEntity, SessionStatus } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { PlatformStats } from "../schemas.js";

export class GetPlatformStatsUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(): Promise<PlatformStats> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      activeSubscriptions,
      totalSessions,
      activeSessions,
      totalCharacters,
      recentSignups,
    ] = await Promise.all([
      this.userRepo.count(),
      this.subscriptionRepo.count({ where: { status: "active" } }),
      this.sessionRepo.count(),
      this.sessionRepo.count({ where: { status: SessionStatus.ACTIVE } }),
      this.characterRepo.count(),
      this.userRepo.count({ where: { createdAt: MoreThan(sevenDaysAgo) } }),
    ]);

    return {
      totalUsers,
      activeSubscriptions,
      totalSessions,
      activeSessions,
      totalCharacters,
      recentSignups,
    };
  }
}
