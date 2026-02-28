import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import {
  createPositionLogQueue,
  createPositionLogWorker,
  registerRepeatableJob,
  closePositionLogQueue,
} from "../shared/queue/position-log.queue.js";
import {
  createDiscordNotificationQueue,
  createDiscordNotificationWorker,
  registerPeriodicStatsJob,
  closeDiscordNotificationQueue,
} from "../shared/queue/discord-notification.queue.js";

async function queuePlugin(fastify: FastifyInstance) {
  createPositionLogQueue();
  const positionWorker = createPositionLogWorker(fastify.orm);
  await registerRepeatableJob();

  positionWorker.on("failed", (job, err) => {
    fastify.log.error({ jobId: job?.id, err }, "Position log job failed");
  });

  fastify.log.info("Position log worker started");

  createDiscordNotificationQueue();
  const discordWorker = createDiscordNotificationWorker(fastify.orm);
  await registerPeriodicStatsJob();

  discordWorker.on("failed", (job, err) => {
    fastify.log.error({ jobId: job?.id, err }, "Discord notification job failed");
  });

  fastify.log.info("Discord notification worker started");

  fastify.addHook("onClose", async () => {
    await closePositionLogQueue();
    fastify.log.info("Position log worker stopped");
    await closeDiscordNotificationQueue();
    fastify.log.info("Discord notification worker stopped");
  });
}

export default fp(queuePlugin, {
  name: "queue",
  dependencies: ["database"],
});
