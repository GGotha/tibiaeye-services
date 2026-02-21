import type { Repository } from "typeorm";
import { Like } from "typeorm";
import { UserEntity, UserStatus } from "../../../entities/user.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import type { UserListQuery, AdminUser } from "../schemas.js";

export class ListUsersUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
  ) {}

  async execute(query: UserListQuery): Promise<AdminUser[]> {
    const where: Record<string, unknown> = {};

    if (query.search) {
      where.email = Like(`%${query.search}%`);
    }

    if (query.status) {
      where.status = query.status as UserStatus;
    }

    const users = await this.userRepo.find({
      where,
      order: { createdAt: "DESC" },
      take: query.limit,
      skip: query.offset,
    });

    const results: AdminUser[] = [];

    for (const user of users) {
      const [subscription, charactersCount, sessionsCount] = await Promise.all([
        this.subscriptionRepo.findOne({
          where: { userId: user.id },
          relations: ["plan"],
        }),
        this.characterRepo.count({ where: { userId: user.id } }),
        this.getSessionsCount(user.id),
      ]);

      results.push({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        subscription: subscription
          ? {
              id: subscription.id,
              planName: subscription.plan.name,
              status: subscription.status,
              currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
            }
          : null,
        charactersCount,
        sessionsCount,
      });
    }

    return results;
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
