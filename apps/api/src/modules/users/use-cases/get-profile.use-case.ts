import type { Repository } from "typeorm";
import { UserEntity } from "../../../entities/user.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";
import type { UserProfile } from "../schemas.js";

export class GetProfileUseCase {
  constructor(private readonly userRepo: Repository<UserEntity>) {}

  async execute(userId: string): Promise<UserProfile> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
