import type { Repository } from "typeorm";
import { UserEntity } from "../../../entities/user.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";
import type { AdminUser } from "../schemas.js";

export class GetUserUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
  ) {}

  async execute(userId: string): Promise<AdminUser> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const [subscription, charactersCount, sessionsCount] = await Promise.all([
      this.subscriptionRepo.findOne({
        where: { userId: user.id },
        relations: ["plan"],
      }),
      this.characterRepo.count({ where: { userId: user.id } }),
      this.getSessionsCount(user.id),
    ]);

    return {
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
