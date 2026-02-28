import { Queue, Worker } from "bullmq";
import type { DataSource } from "typeorm";
import { redisConnection } from "../../config/redis.js";
import { PositionLogEntity } from "../../entities/position-log.entity.js";
import { drain } from "./position-buffer.js";

const QUEUE_NAME = "position-log";
const FLUSH_INTERVAL_MS = 10_000;

let queue: Queue | null = null;
let worker: Worker | null = null;

export function createPositionLogQueue(): Queue {
  queue = new Queue(QUEUE_NAME, { connection: redisConnection });
  return queue;
}

export function createPositionLogWorker(dataSource: DataSource): Worker {
  const positionLogRepo = dataSource.getRepository(PositionLogEntity);

  worker = new Worker(
    QUEUE_NAME,
    async () => {
      const positions = drain();
      if (positions.length === 0) return;

      await positionLogRepo.insert(
        positions.map((p) => ({
          sessionId: p.sessionId,
          x: p.x,
          y: p.y,
          z: p.z,
          recordedAt: p.recordedAt,
        })),
      );
    },
    { connection: redisConnection },
  );

  return worker;
}

export async function registerRepeatableJob(): Promise<void> {
  if (!queue) return;

  await queue.upsertJobScheduler(
    "flush-positions",
    { every: FLUSH_INTERVAL_MS },
    { name: "flush" },
  );
}

export async function closePositionLogQueue(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
  if (queue) {
    await queue.close();
    queue = null;
  }
}
