import type { Repository } from "typeorm";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";

export interface GenerateLicenseInput {
  userId: string;
  subscriptionId: string;
}

export interface GenerateLicenseOutput {
  licenseKey: string; // Plain key (shown once)
  keyPrefix: string;
  id: string;
}

export class GenerateLicenseUseCase {
  constructor(private readonly licenseKeyRepo: Repository<LicenseKeyEntity>) {}

  async execute(input: GenerateLicenseInput): Promise<GenerateLicenseOutput> {
    // Delete existing keys for this subscription (unique constraint: 1 key per subscription)
    await this.licenseKeyRepo.delete({ subscriptionId: input.subscriptionId });

    // Also revoke any other active keys for this user (just to be safe)
    await this.licenseKeyRepo.update(
      { userId: input.userId, status: "active" },
      { status: "revoked" },
    );

    // Generate new key: tm_ + 32 random chars
    const randomPart = crypto.randomBytes(24).toString("base64url").slice(0, 32);
    const licenseKey = `tm_${randomPart}`;
    const keyPrefix = licenseKey.slice(0, 11); // tm_ + first 8 chars

    // Hash the key
    const keyHash = await bcrypt.hash(licenseKey, 10);

    // Create license key record
    const record = this.licenseKeyRepo.create({
      userId: input.userId,
      subscriptionId: input.subscriptionId,
      keyHash,
      keyPrefix,
      status: "active",
    });

    await this.licenseKeyRepo.save(record);

    return {
      licenseKey, // Return plain key (only shown once!)
      keyPrefix,
      id: record.id,
    };
  }
}
