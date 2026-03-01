import type { Repository } from "typeorm";
import { UserEntity, UserStatus } from "../../../entities/user.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";
import type { AdminUser } from "../schemas.js";

export class SuspendUserUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
  ) {}

  async execute(
    userId: string,
    suspend: boolean,
    _reason?: string,
  ): Promise<AdminUser> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (suspend) {
      user.status = UserStatus.SUSPENDED;
      await this.userRepo.save(user);

      // Revoke all license keys
      await this.licenseKeyRepo.update(
        { userId, status: "active" },
        { status: "revoked" },
      );
    } else {
      user.status = UserStatus.ACTIVE;
      await this.userRepo.save(user);
    }

    // Return full User object
    const [subscription, charactersCount, sessionsCount] = await Promise.all([
      this.subscriptionRepo.findOne({ where: { userId } }),
      this.characterRepo.count({ where: { userId } }),
      this.getSessionsCount(userId),
    ]);

    const subscriptionStatus: "active" | "cancelled" | "past_due" | "none" =
      (subscription?.status as "active" | "cancelled" | "past_due") || "none";

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role as "user" | "admin",
      status: user.status as "active" | "suspended" | "banned",
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: null,
      subscriptionStatus,
      charactersCount,
      sessionsCount,
    };
  }

  private async getSessionsCount(userId: string): Promise<number> {
    const characters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });
    if (characters.length === 0) return 0;
    return this.sessionRepo.count({
      where: characters.map((c) => ({ characterId: c.id })),
    });
  }
}
