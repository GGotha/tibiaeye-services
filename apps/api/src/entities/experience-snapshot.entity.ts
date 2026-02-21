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

@Entity("experience_snapshots")
@Index(["sessionId", "recordedAt"])
export class ExperienceSnapshotEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "uuid" })
  sessionId: string;

  @ManyToOne(() => SessionEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sessionId" })
  session: SessionEntity;

  @Column({ type: "bigint" })
  experience: string;

  @Column({ type: "int" })
  level: number;

  @CreateDateColumn({ type: "timestamp" })
  recordedAt: Date;
}
