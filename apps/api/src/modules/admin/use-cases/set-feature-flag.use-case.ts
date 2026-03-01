import type { Repository } from "typeorm";
import { FeatureFlagEntity } from "../../../entities/feature-flag.entity.js";
import { NotFoundError } from "../../../shared/errors/index.js";

export class SetFeatureFlagUseCase {
  constructor(
    private readonly featureFlagRepo: Repository<FeatureFlagEntity>,
  ) {}

  async execute(flagId: string, enabled: boolean) {
    const flag = await this.featureFlagRepo.findOne({ where: { id: flagId } });
    if (!flag) throw new NotFoundError("Feature flag not found");

    flag.enabled = enabled;
    await this.featureFlagRepo.save(flag);

    return {
      id: flag.id,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      updatedAt: flag.updatedAt.toISOString(),
    };
  }
}
