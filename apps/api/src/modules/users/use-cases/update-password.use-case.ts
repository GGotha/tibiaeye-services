import type { Repository } from "typeorm";
import bcrypt from "bcrypt";
import { UserEntity } from "../../../entities/user.entity.js";
import { NotFoundError, UnauthorizedError } from "../../../shared/errors/index.js";
import type { UpdatePasswordInput } from "../schemas.js";

export class UpdatePasswordUseCase {
  constructor(private readonly userRepo: Repository<UserEntity>) {}

  async execute(userId: string, input: UpdatePasswordInput): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isValidPassword = await bcrypt.compare(input.currentPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);

    await this.userRepo.update(userId, { passwordHash });

    return { message: "Password updated successfully" };
  }
}
