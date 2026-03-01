import type { Repository } from "typeorm";
import { UserEntity } from "../../../entities/user.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

export class DeleteUserUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    // Cascade delete handles characters, sessions, license keys, etc.
    await this.userRepo.remove(user);
  }
}
