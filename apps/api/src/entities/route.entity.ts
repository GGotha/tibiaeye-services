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
import { CharacterEntity } from "./character.entity.js";

export type WaypointType =
  | "walk" | "moveUp" | "moveDown" | "useRope" | "useShovel" | "useHole"
  | "useLadder" | "useTeleport" | "label" | "stand" | "useHotkey"
  | "refillChecker" | "depositGold" | "refill" | "refillPotions"
  | "depositItems" | "dropFlasks";

export interface RouteWaypoint {
  id: number;
  type: WaypointType;
  coordinate?: [number, number, number];
  label?: string;
  options?: Record<string, unknown>;
  comment?: string;
}

@Entity("routes")
@Index(["userId"])
export class RouteEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description: string | null;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Column({ type: "uuid", nullable: true })
  characterId: string | null;

  @ManyToOne(() => CharacterEntity, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "characterId" })
  character: CharacterEntity | null;

  @Column({ type: "jsonb", default: [] })
  waypoints: RouteWaypoint[];

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ type: "boolean", default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
