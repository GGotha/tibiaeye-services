import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./user.entity.js";

export interface LootDropPreferences {
  enabled: boolean;
  minValue: number;
}

export interface LowHpPreferences {
  enabled: boolean;
  threshold: number;
}

export interface PeriodicStatsPreferences {
  enabled: boolean;
  intervalMinutes: number;
}

export interface NotificationPreferences {
  sessionStarted: boolean;
  sessionEnded: boolean;
  death: boolean;
  levelUp: boolean;
  lootDrop: LootDropPreferences;
  lowHp: LowHpPreferences;
  botStuck: boolean;
  periodicStats: PeriodicStatsPreferences;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  sessionStarted: true,
  sessionEnded: true,
  death: true,
  levelUp: true,
  lootDrop: { enabled: false, minValue: 10_000 },
  lowHp: { enabled: false, threshold: 20 },
  botStuck: true,
  periodicStats: { enabled: true, intervalMinutes: 5 },
};

@Entity("discord_integrations")
@Index(["userId", "isActive"])
export class DiscordIntegrationEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Column({ type: "varchar", length: 100 })
  label: string;

  @Column({ type: "text" })
  webhookUrl: string;

  @Column({ type: "varchar", length: 100 })
  webhookId: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  guildName: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  channelName: string | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "simple-json" })
  notificationPreferences: NotificationPreferences;

  @Column({ type: "timestamptz", nullable: true })
  lastNotifiedAt: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
