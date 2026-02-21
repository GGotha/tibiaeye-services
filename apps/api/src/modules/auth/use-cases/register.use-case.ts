import type { Repository } from "typeorm";
import type { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { UserEntity, UserRole, UserStatus } from "../../../entities/user.entity.js";
import { PlanEntity } from "../../../entities/plan.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { GenerateLicenseUseCase } from "../../license/use-cases/generate-license.use-case.js";
import { ConflictError } from "../../../shared/errors/index.js";
import type { RegisterInput, AuthResponse } from "../schemas.js";

export interface AuthResult extends AuthResponse {
  token: string;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwt: FastifyInstance["jwt"],
    private readonly planRepo: Repository<PlanEntity>,
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
  ) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await this.userRepo.findOne({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = this.userRepo.create({
      email: input.email,
      passwordHash,
      name: input.name || null,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });

    await this.userRepo.save(user);

    // Auto-assign Free plan + generate license key
    const licenseKey = await this.createFreeSubscription(user.id);

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      licenseKey,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  private async createFreeSubscription(userId: string): Promise<string | null> {
    const freePlan = await this.planRepo.findOne({
      where: { name: "Free", isActive: true },
    });

    if (!freePlan) {
      return null;
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setFullYear(periodEnd.getFullYear() + 100); // Free plan never expires

    const subscription = this.subscriptionRepo.create({
      userId,
      planId: freePlan.id,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    });

    await this.subscriptionRepo.save(subscription);

    const generateLicense = new GenerateLicenseUseCase(this.licenseKeyRepo);
    const { licenseKey } = await generateLicense.execute({
      userId,
      subscriptionId: subscription.id,
    });

    return licenseKey;
  }
}
