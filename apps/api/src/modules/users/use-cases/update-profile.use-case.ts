import type { Repository } from "typeorm";
import { UserEntity } from "../../../entities/user.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";
import type { UpdateProfileInput, UserProfile } from "../schemas.js";

export class UpdateProfileUseCase {
  constructor(private readonly userRepo: Repository<UserEntity>) {}

  async execute(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (input.name !== undefined) {
      user.name = input.name;
    }

    if (input.avatar !== undefined) {
      user.avatar = input.avatar;
    }

    await this.userRepo.save(user);

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
