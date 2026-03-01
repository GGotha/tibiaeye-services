import type { Repository } from "typeorm";
import { SystemSettingEntity } from "../../../entities/system-setting.entity.js";

interface MaintenanceMode {
  enabled: boolean;
  message: string | null;
  scheduledEnd: string | null;
}

export class GetMaintenanceUseCase {
  constructor(
    private readonly settingRepo: Repository<SystemSettingEntity>,
  ) {}

  async execute(): Promise<MaintenanceMode> {
    const setting = await this.settingRepo.findOne({
      where: { key: "maintenance" },
    });

    if (!setting) {
      return {
        enabled: false,
        message: null,
        scheduledEnd: null,
      };
    }

    const value = setting.value as MaintenanceMode;
    return {
      enabled: value.enabled ?? false,
      message: value.message ?? null,
      scheduledEnd: value.scheduledEnd ?? null,
    };
  }
}
