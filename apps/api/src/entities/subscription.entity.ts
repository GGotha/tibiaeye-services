import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "./user.entity.js";
import { PlanEntity } from "./plan.entity.js";

export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing";

@Entity("subscriptions")
@Index(["userId"], { unique: true })
export class SubscriptionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Column({ type: "uuid" })
  planId: string;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: "planId" })
  plan: PlanEntity;

  @Column({
    type: "enum",
    enum: ["active", "cancelled", "past_due", "trialing"],
    default: "active",
  })
  status: SubscriptionStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  externalId: string | null;

  @Column({ type: "timestamp" })
  currentPeriodStart: Date;

  @Column({ type: "timestamp" })
  currentPeriodEnd: Date;

  @Column({ type: "boolean", default: false })
  cancelAtPeriodEnd: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
