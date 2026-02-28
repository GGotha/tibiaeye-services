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
import { CharacterEntity } from "./character.entity.js";

@Entity("bot_configs")
@Index(["characterId"], { unique: true })
export class BotConfigEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", unique: true })
  characterId: string;

  @ManyToOne(() => CharacterEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "characterId" })
  character: CharacterEntity;

  @Column({ type: "jsonb", default: {} })
  config: Record<string, unknown>;

  @Column({ type: "int", default: 1 })
  version: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
