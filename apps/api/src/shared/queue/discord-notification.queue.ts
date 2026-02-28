import { Queue, Worker } from "bullmq";
import type { DataSource, Repository } from "typeorm";
import { redisConnection } from "../../config/redis.js";
import {
  DiscordIntegrationEntity,
  type NotificationPreferences,
} from "../../entities/discord-integration.entity.js";
import { SessionEntity, SessionStatus } from "../../entities/session.entity.js";
import {
  DISCORD_QUEUE_NAME,
  PERIODIC_STATS_INTERVAL_MS,
  MAX_RETRY_ATTEMPTS,
} from "../../modules/discord/constants.js";
import { sendEmbed, DiscordRateLimitError } from "../discord/webhook-client.js";
import {
  buildSessionStartedEmbed,
  buildSessionEndedEmbed,
  buildDeathEmbed,
  buildLevelUpEmbed,
  buildLootDropEmbed,
  buildLowHpEmbed,
  buildBotStuckEmbed,
  buildPeriodicStatsEmbed,
} from "../discord/embed-builder.js";
import { getRoom } from "../realtime/room-manager.js";

let queue: Queue | null = null;
let worker: Worker | null = null;

export interface DiscordNotificationJobData {
  userId: string;
  sessionId: string;
  notificationType: keyof NotificationPreferences;
  data: Record<string, unknown>;
}

export function getDiscordNotificationQueue(): Queue | null {
  return queue;
}

export function createDiscordNotificationQueue(): Queue {
  queue = new Queue(DISCORD_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: MAX_RETRY_ATTEMPTS,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });
  return queue;
}

type EmbedResult = { title: string; color: number; fields: Array<{ name: string; value: string; inline?: boolean }>; footer: { text: string }; timestamp: string; description?: string };

function buildEmbedForNotification(
  notificationType: string,
  data: Record<string, unknown>,
): EmbedResult | null {
  const characterName = (data.characterName as string) || "Unknown";

  switch (notificationType) {
    case "sessionStarted":
      return buildSessionStartedEmbed({
        characterName,
        huntLocation: (data.huntLocation as string) || null,
        level: (data.level as number) || null,
      });
    case "sessionEnded":
      return buildSessionEndedEmbed({
        characterName,
        duration: (data.duration as number) || 0,
        totalKills: (data.totalKills as number) || 0,
        xpPerHour: (data.xpPerHour as number) || 0,
        totalLootValue: (data.totalLootValue as number) || 0,
        huntLocation: (data.huntLocation as string) || null,
      });
    case "death":
      return buildDeathEmbed({
        characterName,
        killer: data.killer as string | undefined,
        positionX: data.positionX as number | undefined,
        positionY: data.positionY as number | undefined,
        positionZ: data.positionZ as number | undefined,
      });
    case "levelUp":
      return buildLevelUpEmbed({
        characterName,
        newLevel: (data.newLevel as number) || 0,
      });
    case "lootDrop":
      return buildLootDropEmbed({
        characterName,
        itemName: (data.itemName as string) || "Unknown",
        quantity: (data.quantity as number) || 1,
        estimatedValue: (data.estimatedValue as number) || 0,
      });
    case "lowHp":
      return buildLowHpEmbed({
        characterName,
        hpPercent: (data.hpPercent as number) || 0,
        positionX: data.positionX as number | undefined,
        positionY: data.positionY as number | undefined,
        positionZ: data.positionZ as number | undefined,
      });
    case "botStuck":
      return buildBotStuckEmbed({
        characterName,
        currentTask: data.currentTask as string | undefined,
        positionX: data.positionX as number | undefined,
        positionY: data.positionY as number | undefined,
        positionZ: data.positionZ as number | undefined,
      });
    default:
      return null;
  }
}

function isNotificationEnabled(
  preferences: NotificationPreferences,
  notificationType: string,
  data: Record<string, unknown>,
): boolean {
  switch (notificationType) {
    case "sessionStarted":
      return preferences.sessionStarted;
    case "sessionEnded":
      return preferences.sessionEnded;
    case "death":
      return preferences.death;
    case "levelUp":
      return preferences.levelUp;
    case "lootDrop":
      if (!preferences.lootDrop.enabled) return false;
      return ((data.estimatedValue as number) || 0) >= preferences.lootDrop.minValue;
    case "lowHp":
      return preferences.lowHp.enabled;
    case "botStuck":
      return preferences.botStuck;
    default:
      return false;
  }
}

export function createDiscordNotificationWorker(dataSource: DataSource): Worker {
  const integrationRepo = dataSource.getRepository(DiscordIntegrationEntity);
  const sessionRepo = dataSource.getRepository(SessionEntity);

  worker = new Worker(
    DISCORD_QUEUE_NAME,
    async (job) => {
      if (job.name === "periodic-stats") {
        await handlePeriodicStats(integrationRepo, sessionRepo);
        return;
      }

      const { userId, notificationType, data } = job.data as DiscordNotificationJobData;
      await handleNotification(integrationRepo, userId, notificationType, data);
    },
    { connection: redisConnection },
  );

  return worker;
}

async function handleNotification(
  integrationRepo: Repository<DiscordIntegrationEntity>,
  userId: string,
  notificationType: string,
  data: Record<string, unknown>,
): Promise<void> {
  const integrations = await integrationRepo.find({
    where: { userId, isActive: true },
  });

  const embed = buildEmbedForNotification(notificationType, data);
  if (!embed) return;

  for (const integration of integrations) {
    if (!isNotificationEnabled(integration.notificationPreferences, notificationType, data)) {
      continue;
    }

    const result = await sendEmbed(integration.webhookUrl, embed);

    if (result.webhookDeleted) {
      await integrationRepo.update(integration.id, { isActive: false });
      continue;
    }

    if (result.success) {
      await integrationRepo.update(integration.id, { lastNotifiedAt: new Date() });
    }
  }
}

async function handlePeriodicStats(
  integrationRepo: Repository<DiscordIntegrationEntity>,
  sessionRepo: Repository<SessionEntity>,
): Promise<void> {
  const activeSessions = await sessionRepo.find({
    where: { status: SessionStatus.ACTIVE },
    relations: ["character"],
  });

  if (activeSessions.length === 0) return;

  const userIds = [...new Set(activeSessions.map((s) => s.character.userId))];

  const integrations = await integrationRepo
    .createQueryBuilder("di")
    .where("di.userId IN (:...userIds)", { userIds })
    .andWhere("di.isActive = :isActive", { isActive: true })
    .getMany();

  const enabledIntegrations = integrations.filter(
    (i) => i.notificationPreferences.periodicStats.enabled,
  );

  if (enabledIntegrations.length === 0) return;

  for (const session of activeSessions) {
    const userId = session.character.userId;
    const userIntegrations = enabledIntegrations.filter((i) => i.userId === userId);
    if (userIntegrations.length === 0) continue;

    const room = getRoom(session.id);

    const embed = buildPeriodicStatsEmbed({
      characterName: session.character.name,
      duration: session.duration,
      xpPerHour: session.xpPerHour,
      totalKills: session.totalKills,
      totalLootValue: session.totalLootValue,
      hpPercent: room?.lastStatus?.hpPercent,
      manaPercent: room?.lastStatus?.manaPercent,
      positionX: room?.lastPosition?.x,
      positionY: room?.lastPosition?.y,
      positionZ: room?.lastPosition?.z,
      huntLocation: session.huntLocation,
    });

    for (const integration of userIntegrations) {
      try {
        const result = await sendEmbed(integration.webhookUrl, embed);
        if (result.webhookDeleted) {
          await integrationRepo.update(integration.id, { isActive: false });
        } else if (result.success) {
          await integrationRepo.update(integration.id, { lastNotifiedAt: new Date() });
        }
      } catch (error) {
        if (error instanceof DiscordRateLimitError) {
          continue;
        }
        throw error;
      }
    }
  }
}

export async function registerPeriodicStatsJob(): Promise<void> {
  if (!queue) return;

  await queue.upsertJobScheduler(
    "periodic-stats-scheduler",
    { every: PERIODIC_STATS_INTERVAL_MS },
    { name: "periodic-stats" },
  );
}

export async function closeDiscordNotificationQueue(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
  if (queue) {
    await queue.close();
    queue = null;
  }
}
