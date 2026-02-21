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

      return result;
    },
  );
};
