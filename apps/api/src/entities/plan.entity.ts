import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("plans")
export class PlanEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column("decimal", { precision: 10, scale: 2 })
  priceMonthly: number;

  @Column("decimal", { precision: 10, scale: 2 })
  priceYearly: number;

  @Column("int")
  maxCharacters: number;

  @Column("int")
  historyDays: number;

  @Column("int")
  apiRequestsPerDay: number;

  @Column("simple-json")
  features: string[];

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
