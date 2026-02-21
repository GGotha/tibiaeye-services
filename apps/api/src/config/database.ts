import { DataSource } from "typeorm";
import { env } from "./env.js";

export const dataSource = new DataSource({
  type: "postgres",
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  entities: ["src/entities/*.entity.ts"],
  synchronize: env.NODE_ENV === "development",
  logging: env.NODE_ENV === "development",
});
