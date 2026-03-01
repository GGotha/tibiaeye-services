import type { Repository } from "typeorm";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

export class RevokeApiKeyUseCase {
  constructor(
    private readonly licenseKeyRepo: Repository<LicenseKeyEntity>,
  ) {}

  async execute(keyId: string): Promise<void> {
    const lk = await this.licenseKeyRepo.findOne({ where: { id: keyId } });
    if (!lk) throw new NotFoundError("API key not found");

    lk.status = "revoked";
    await this.licenseKeyRepo.save(lk);
  }
}
