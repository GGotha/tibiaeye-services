import type { Repository } from "typeorm";
import bcrypt from "bcrypt";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import type { ValidateLicenseInput, ValidateLicenseResponse } from "../schemas.js";

export class ValidateLicenseUseCase {
  constructor(private readonly licenseKeyRepo: Repository<LicenseKeyEntity>) {}

  async execute(input: ValidateLicenseInput): Promise<ValidateLicenseResponse> {
    const apiKey = input.apiKey;

    // Validate format
    if (!apiKey.startsWith("tm_")) {
      return { valid: false, message: "Invalid API key format" };
    }

    // Extract prefix for optimized lookup
    const keyPrefix = apiKey.slice(0, 11); // tm_ + 8 chars

    // Find key by prefix
    const licenseKey = await this.licenseKeyRepo.findOne({
      where: { keyPrefix, status: "active" },
      relations: ["subscription"],
    });

    if (!licenseKey) {
      return { valid: false, message: "Invalid API key" };
    }

    // Verify hash
    const isValid = await bcrypt.compare(apiKey, licenseKey.keyHash);
    if (!isValid) {
      return { valid: false, message: "Invalid API key" };
    }

    // Check subscription status
    if (!licenseKey.subscription) {
      return { valid: false, message: "No subscription found" };
    }

    if (licenseKey.subscription.status !== "active") {
      return { valid: false, message: "Subscription is not active" };
    }

    // Check subscription expiration
    const now = new Date();
    if (now > licenseKey.subscription.currentPeriodEnd) {
      return { valid: false, message: "Subscription has expired" };
    }

    // Calculate days remaining
    const diffMs = licenseKey.subscription.currentPeriodEnd.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Update last used
    await this.licenseKeyRepo.update(licenseKey.id, {
      lastUsedAt: now,
      totalRequests: () => "totalRequests + 1",
    });

    return {
      valid: true,
      userId: licenseKey.userId,
      daysRemaining,
    };
  }
}
