import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BANNED = "banned",
}

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  passwordHash: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  name: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  avatar: string | null;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
