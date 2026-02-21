import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CharacterEntity } from "./character.entity.js";

export enum SessionStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  CRASHED = "crashed",
}

@Entity("sessions")
@Index(["characterId", "status"])
@Index(["status", "startedAt"])
export class SessionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  characterId: string;

  @ManyToOne(() => CharacterEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "characterId" })
  character: CharacterEntity;

  @Column({ type: "varchar", length: 255, nullable: true })
  huntLocation: string | null;

  @Column({ type: "enum", enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  endedAt: Date | null;

  @Column({ type: "int", nullable: true })
  initialLevel: number | null;

  @Column({ type: "bigint", nullable: true })
  initialExperience: string | null;

  @Column({ type: "int", nullable: true })
  finalLevel: number | null;

  @Column({ type: "bigint", nullable: true })
  finalExperience: string | null;

  @Column({ type: "int", default: 0 })
  totalKills: number;

  @Column({ type: "bigint", default: "0" })
  totalExperience: string;

  @Column({ type: "int", default: 0 })
  totalLootValue: number;

  get duration(): number {
    const end = this.endedAt || new Date();
    return Math.round((end.getTime() - this.startedAt.getTime()) / 1000);
  }

  get xpPerHour(): number {
    const hours = this.duration / 3600;
    if (hours < 0.01) return 0;
    return Math.round(Number(this.totalExperience) / hours);
  }
}
