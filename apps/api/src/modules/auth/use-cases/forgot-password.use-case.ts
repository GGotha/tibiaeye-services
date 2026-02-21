import type { Repository } from "typeorm";
import crypto from "node:crypto";
import { UserEntity } from "../../../entities/user.entity.js";
import type { ForgotPasswordInput } from "../schemas.js";

export class ForgotPasswordUseCase {
  constructor(private readonly userRepo: Repository<UserEntity>) {}

  async execute(input: ForgotPasswordInput): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { email: input.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: "If the email exists, a reset link will be sent" };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Token expires in 1 hour
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.userRepo.update(user.id, {
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires,
    });

    // TODO: Send email with resetToken
    // In production, this would call an email service
    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    return { message: "If the email exists, a reset link will be sent" };
  }
}
