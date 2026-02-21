import type { Repository } from "typeorm";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { MoreThan } from "typeorm";
import { UserEntity } from "../../../entities/user.entity.js";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import type { ResetPasswordInput } from "../schemas.js";

export class ResetPasswordUseCase {
  constructor(private readonly userRepo: Repository<UserEntity>) {}

  async execute(input: ResetPasswordInput): Promise<{ message: string }> {
    const tokenHash = crypto.createHash("sha256").update(input.token).digest("hex");

    const user = await this.userRepo.findOne({
      where: {
        resetPasswordToken: tokenHash,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid or expired reset token");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    await this.userRepo.update(user.id, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: "Password reset successfully" };
  }
}
