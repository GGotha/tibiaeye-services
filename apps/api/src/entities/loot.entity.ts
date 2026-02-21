import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SessionEntity } from "./session.entity.js";

@Entity("loot")
@Index(["sessionId"])
@Index(["itemName"])
export class LootEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "uuid" })
  sessionId: string;

  @ManyToOne(() => SessionEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sessionId" })
  session: SessionEntity;

  @Column({ type: "varchar", length: 100 })
  itemName: string;

  @Column({ type: "int", default: 1 })
  quantity: number;

  @Column({ type: "int", nullable: true })
  estimatedValue: number | null;

  @CreateDateColumn({ type: "timestamp" })
  lootedAt: Date;
}
