import type { Repository } from "typeorm";
import type { FastifyInstance } from "fastify";
import { UserEntity, UserStatus } from "../../../entities/user.entity.js";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import type { AuthResult } from "./register.use-case.js";
import type { JwtPayload } from "../../../plugins/auth.plugin.js";

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwt: FastifyInstance["jwt"],
  ) {}

  async execute(currentPayload: JwtPayload): Promise<AuthResult> {
    const user = await this.userRepo.findOne({
      where: { id: currentPayload.sub },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError("User not found or inactive");
    }

    const newToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
