import type { Repository } from "typeorm";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

export class RevokeLicenseUseCase {
  constructor(
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
  ) {}

  async execute(licenseId: string, _reason?: string) {
    const lk = await this.licenseKeyRepo.findOne({
      where: { id: licenseId },
      relations: ["user", "subscription"],
    });

    if (!lk) throw new NotFoundError("License not found");

    lk.status = "revoked";
    await this.licenseKeyRepo.save(lk);

    const expiresAt = lk.subscription?.currentPeriodEnd;

    return {
      id: lk.id,
      userId: lk.userId,
      userEmail: lk.user?.email || "",
      userName: lk.user?.name || null,
      keyPrefix: lk.keyPrefix,
      status: "revoked" as const,
      expiresAt: expiresAt?.toISOString() || new Date().toISOString(),
      createdAt: lk.createdAt.toISOString(),
      lastUsedAt: lk.lastUsedAt?.toISOString() || null,
      activationsCount: lk.totalRequests,
      maxActivations: 1,
    };
  }
}
