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

@Entity("position_logs")
@Index(["sessionId", "recordedAt"])
export class PositionLogEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "uuid" })
  sessionId: string;

  @ManyToOne(() => SessionEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sessionId" })
  session: SessionEntity;

  @Column({ type: "int" })
  x: number;

  @Column({ type: "int" })
  y: number;

  @Column({ type: "smallint" })
  z: number;

  @CreateDateColumn({ type: "timestamptz" })
  recordedAt: Date;
}
