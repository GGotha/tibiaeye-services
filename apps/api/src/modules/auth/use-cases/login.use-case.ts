import type { Repository } from "typeorm";
import type { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { UserEntity, UserStatus } from "../../../entities/user.entity.js";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import type { LoginInput } from "../schemas.js";
import type { AuthResult } from "./register.use-case.js";

export class LoginUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwt: FastifyInstance["jwt"],
  ) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepo.findOne({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError("Account is not active");
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
