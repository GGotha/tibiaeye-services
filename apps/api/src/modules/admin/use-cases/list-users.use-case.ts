import type { Repository } from "typeorm";
import { ILike } from "typeorm";
import { UserEntity, UserStatus } from "../../../entities/user.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import type { UserListQuery } from "../schemas.js";

type SubscriptionStatusType = "active" | "cancelled" | "past_due" | "none";

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "user" | "admin";
  status: "active" | "suspended" | "banned";
  createdAt: string;
  lastLoginAt: string | null;
  subscriptionStatus: SubscriptionStatusType;
  charactersCount: number;
  sessionsCount: number;
}

interface PaginatedUsersResult {
  data: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListUsersUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
    private readonly sessionRepo: Repository<SessionEntity>,
  ) {}

  async execute(query: UserListQuery): Promise<PaginatedUsersResult> {
    const where: Array<Record<string, unknown>> = [];
    const baseWhere: Record<string, unknown> = {};

    if (query.status) {
      baseWhere.status = query.status as UserStatus;
    }

    if (query.search) {
      // Search by name OR email
      const nameWhere = { ...baseWhere, name: ILike(`%${query.search}%`) };
      const emailWhere = { ...baseWhere, email: ILike(`%${query.search}%`) };
      where.push(nameWhere, emailWhere);
    } else {
      where.push(baseWhere);
    }

    const orderField = query.sortBy || "createdAt";
    const orderDir = (query.sortOrder || "desc").toUpperCase() as "ASC" | "DESC";

    const skip = (query.page - 1) * query.limit;

    const [users, total] = await this.userRepo.findAndCount({
      where: where.length === 1 ? where[0] : where,
      order: { [orderField]: orderDir },
      take: query.limit,
      skip,
    });

    const data = [];

    for (const user of users) {
      const [subscription, charactersCount, sessionsCount] = await Promise.all([
        this.subscriptionRepo.findOne({
          where: { userId: user.id },
          relations: ["plan"],
        }),
        this.characterRepo.count({ where: { userId: user.id } }),
        this.getSessionsCount(user.id),
      ]);

      let subscriptionStatus: SubscriptionStatusType = "none";
      if (subscription) {
        subscriptionStatus = subscription.status as SubscriptionStatusType;
      }

      // Filter by subscriptionStatus if specified
      if (query.subscriptionStatus && subscriptionStatus !== query.subscriptionStatus) {
        continue;
      }

      data.push({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: null as string | null,
        subscriptionStatus,
        charactersCount,
        sessionsCount,
      });
    }

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
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
