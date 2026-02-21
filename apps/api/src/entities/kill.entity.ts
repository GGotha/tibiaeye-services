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

@Entity("kills")
@Index(["sessionId", "killedAt"])
@Index(["creatureName"])
export class KillEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "uuid" })
  sessionId: string;

  @ManyToOne(() => SessionEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sessionId" })
  session: SessionEntity;

  @Column({ type: "varchar", length: 100 })
  creatureName: string;

  @Column({ type: "int", nullable: true })
  experienceGained: number | null;

  @Column({ type: "int", nullable: true })
  positionX: number | null;

  @Column({ type: "int", nullable: true })
  positionY: number | null;

  @Column({ type: "smallint", nullable: true })
  positionZ: number | null;

  @CreateDateColumn({ type: "timestamp" })
  killedAt: Date;
}
