import type { Repository } from "typeorm";
import { UserEntity } from "../../../entities/user.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

export class DeleteAccountUseCase {
  constructor(private readonly userRepo: Repository<UserEntity>) {}

  async execute(userId: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this.userRepo.remove(user);

    return { message: "Account deleted successfully" };
  }
}
