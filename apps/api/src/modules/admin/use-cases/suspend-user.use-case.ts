import type { Repository } from "typeorm";
import { UserEntity, UserStatus } from "../../../entities/user.entity.js";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

export class SuspendUserUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
  ) {}

  async execute(userId: string, suspend: boolean): Promise<{ message: string }> {
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

      return { message: "User suspended and license keys revoked" };
    } else {
      user.status = UserStatus.ACTIVE;
      await this.userRepo.save(user);

      return { message: "User unsuspended" };
    }
  }
}
