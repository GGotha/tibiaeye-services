import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { FastifyRequest } from "fastify";
import { SessionEntity } from "../../entities/session.entity.js";
import { CharacterEntity } from "../../entities/character.entity.js";
import { KillEntity } from "../../entities/kill.entity.js";
import { LootEntity } from "../../entities/loot.entity.js";
import { ExperienceSnapshotEntity } from "../../entities/experience-snapshot.entity.js";
import { GameEventEntity } from "../../entities/game-event.entity.js";
import type { ApiKeyPayload } from "../../plugins/auth.plugin.js";
import { BatchEventsSchema, BatchResultSchema } from "./schemas.js";
import { ProcessBatchUseCase } from "./use-cases/process-batch.use-case.js";
import { broadcastToRoom } from "../../shared/realtime/room-manager.js";
import { getDiscordNotificationQueue } from "../../shared/queue/discord-notification.queue.js";

export const eventsController: FastifyPluginAsyncZod = async (app) => {
  const sessionRepo = app.getRepository(SessionEntity);
  const characterRepo = app.getRepository(CharacterEntity);
  const killRepo = app.getRepository(KillEntity);
  const lootRepo = app.getRepository(LootEntity);
  const experienceRepo = app.getRepository(ExperienceSnapshotEntity);
  const gameEventRepo = app.getRepository(GameEventEntity);

  app.post(
    "/batch",
    {
      onRequest: [app.authenticateApiKey],
      schema: {
        tags: ["Events"],
        summary: "Process batch of events (Bot)",
        security: [{ apiKeyAuth: [] }],
        body: BatchEventsSchema,
        response: {
          200: BatchResultSchema,
        },
      },
    },
    async (request) => {
      const apiKey = (request as FastifyRequest & { apiKey: ApiKeyPayload }).apiKey;
      const useCase = new ProcessBatchUseCase(
        sessionRepo,
        characterRepo,
        killRepo,
        lootRepo,
        experienceRepo,
        gameEventRepo,
      );
      const result = await useCase.execute(apiKey.userId, request.body);

      const session = await sessionRepo.findOne({
        where: { id: request.body.sessionId },
        relations: ["character"],
      });

      if (session) {
        broadcastToRoom(request.body.sessionId, {
          type: "stats",
          totalKills: session.totalKills,
          totalExperience: Number(session.totalExperience),
          totalLootValue: session.totalLootValue,
          xpPerHour: session.xpPerHour,
          duration: session.duration,
        });
      }

      for (const event of request.body.events) {
        if (event.type === "death" || event.type === "level_up") {
          const { type: eventType, ...eventData } = event;
          broadcastToRoom(request.body.sessionId, {
            type: "event",
            eventType,
            ...eventData,
          });
        }
      }

      // Broadcast timeline events for real-time timeline updates
      const timelineTypes = ["kill", "loot", "death", "level_up", "refill", "attack_start", "waypoint_reached", "warning", "heal", "pause", "resume", "disconnect", "reconnect_retry", "reconnect_success", "reconnect_failure"];
      for (const event of request.body.events) {
        if (timelineTypes.includes(event.type)) {
          const { type: eventType, ...eventData } = event;
          broadcastToRoom(request.body.sessionId, {
            type: "timeline-event",
            eventType,
            ...eventData,
            timestamp: event.timestamp || new Date().toISOString(),
          });
        }
      }

      const discordQueue = getDiscordNotificationQueue();
      if (discordQueue && session) {
        const characterName = session.character?.name ?? "Unknown";

        for (const event of request.body.events) {
          if (event.type === "death") {
            await discordQueue.add("notification", {
              userId: apiKey.userId,
              sessionId: request.body.sessionId,
              notificationType: "death",
              data: { characterName, ...event },
            });
          }

          if (event.type === "level_up") {
            await discordQueue.add("notification", {
              userId: apiKey.userId,
              sessionId: request.body.sessionId,
              notificationType: "levelUp",
              data: { characterName, ...event },
            });
          }

          if (event.type === "loot" && event.estimatedValue && event.estimatedValue > 0) {
            await discordQueue.add("notification", {
              userId: apiKey.userId,
              sessionId: request.body.sessionId,
              notificationType: "lootDrop",
              data: { characterName, ...event },
            });
          }
        }
      }

      return result;
    },
  );
};
