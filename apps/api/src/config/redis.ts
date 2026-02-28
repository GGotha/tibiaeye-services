import { env } from "./env.js";
import type { ConnectionOptions } from "bullmq";

export const redisConnection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
};
