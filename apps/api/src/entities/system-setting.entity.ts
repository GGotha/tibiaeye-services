import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("system_settings")
export class SystemSettingEntity {
  @PrimaryColumn({ type: "varchar", length: 100 })
  key: string;

  @Column({ type: "jsonb" })
  value: unknown;

  @UpdateDateColumn()
  updatedAt: Date;
}
