import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "./user.entity.js";
import { SubscriptionEntity } from "./subscription.entity.js";

export type LicenseKeyStatus = "active" | "revoked";

@Entity("license_keys")
@Index(["subscriptionId"], { unique: true }) // 1 key per subscription
@Index(["keyPrefix"])
export class LicenseKeyEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Column({ type: "uuid" })
  subscriptionId: string;

  @ManyToOne(() => SubscriptionEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "subscriptionId" })
  subscription: SubscriptionEntity;

  @Column({ type: "varchar", length: 255 })
  keyHash: string; // bcrypt hash

  @Column({ type: "varchar", length: 11 })
  keyPrefix: string; // "tm_" + 8 chars for optimized lookup

  @Column({ type: "enum", enum: ["active", "revoked"], default: "active" })
  status: LicenseKeyStatus;

  // REMOVED: expiresAt - uses subscription.currentPeriodEnd

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt: Date | null;

  @Column({ type: "int", default: 0 })
  totalRequests: number;

  @CreateDateColumn()
  createdAt: Date;
}
