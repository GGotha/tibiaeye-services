import type { Repository } from "typeorm";
import { FeatureFlagEntity } from "../../../entities/feature-flag.entity.js";

export class GetFeatureFlagsUseCase {
  constructor(
    private readonly featureFlagRepo: Repository<FeatureFlagEntity>,
  ) {}

  async execute() {
    const flags = await this.featureFlagRepo.find({
      order: { name: "ASC" },
    });

    return flags.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      enabled: f.enabled,
      updatedAt: f.updatedAt.toISOString(),
    }));
  }
}
