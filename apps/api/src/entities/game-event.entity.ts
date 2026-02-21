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

@Entity("game_events")
@Index(["sessionId", "type"])
@Index(["sessionId", "createdAt"])
export class GameEventEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "uuid" })
  sessionId: string;

  @ManyToOne(() => SessionEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sessionId" })
  session: SessionEntity;

  @Column({ type: "varchar", length: 50 })
  type: string;

  @Column({ type: "simple-json", nullable: true })
  data: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
