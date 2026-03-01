import type { Repository } from "typeorm";
import { SystemSettingEntity } from "../../../entities/system-setting.entity.js";

interface MaintenanceMode {
  enabled: boolean;
  message: string | null;
  scheduledEnd: string | null;
}

export class SetMaintenanceUseCase {
  constructor(
    private readonly settingRepo: Repository<SystemSettingEntity>,
  ) {}

  async execute(input: MaintenanceMode): Promise<MaintenanceMode> {
    let setting = await this.settingRepo.findOne({
      where: { key: "maintenance" },
    });

    if (setting) {
      setting.value = input;
    } else {
      setting = this.settingRepo.create({
        key: "maintenance",
        value: input,
      });
    }

    await this.settingRepo.save(setting);

    return {
      enabled: input.enabled,
      message: input.message,
      scheduledEnd: input.scheduledEnd,
    };
  }
}
