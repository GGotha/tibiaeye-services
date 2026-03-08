import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { SessionEntity } from "../../entities/session.entity.js";
import { CharacterEntity } from "../../entities/character.entity.js";
import { PositionLogEntity } from "../../entities/position-log.entity.js";
import type { ApiKeyPayload } from "../../plugins/auth.plugin.js";
import { NotFoundError } from "../../shared/errors/index.js";
import {
  CreateSessionSchema,
  UpdateSessionSchema,
  SessionSchema,
  PaginatedSessionListSchema,
  SessionQuerySchema,
  PositionLogListSchema,
  PositionLogQuerySchema,
} from "./schemas.js";
import { getDiscordNotificationQueue } from "../../shared/queue/discord-notification.queue.js";
import { CreateSessionUseCase } from "./use-cases/create-session.use-case.js";
import { ListSessionsUseCase } from "./use-cases/list-sessions.use-case.js";
import { GetSessionUseCase } from "./use-cases/get-session.use-case.js";
import { UpdateSessionUseCase } from "./use-cases/update-session.use-case.js";
import { GetActiveSessionsUseCase } from "./use-cases/get-active-session.use-case.js";

export const sessionsController: FastifyPluginAsyncZod = async (app) => {
  const sessionRepo = app.getRepository(SessionEntity);
  const characterRepo = app.getRepository(CharacterEntity);
  const positionLogRepo = app.getRepository(PositionLogEntity);

  // POST /api/v1/sessions (Bot - API Key auth)
  app.post(
    "/",
    {
      onRequest: [app.authenticateApiKey],
      schema: {
        tags: ["Sessions"],
        summary: "Create a new hunt session (Bot)",
        security: [{ apiKeyAuth: [] }],
        body: CreateSessionSchema,
        response: {
          201: SessionSchema,
        },
      },
    },
    async (request, reply) => {
      const apiKey = (request as FastifyRequest & { apiKey: ApiKeyPayload }).apiKey;
      const useCase = new CreateSessionUseCase(sessionRepo, characterRepo);
      const result = await useCase.execute(apiKey.userId, request.body);

      const discordQueue = getDiscordNotificationQueue();
      if (discordQueue) {
        await discordQueue.add("notification", {
          userId: apiKey.userId,
          sessionId: result.id,
          notificationType: "sessionStarted",
          data: {
            characterName: result.characterName,
            huntLocation: result.huntLocation,
            level: result.initialLevel,
          },
        });
      }

      return reply.status(201).send(result);
    },
  );

  // GET /api/v1/sessions (User - JWT auth)
  app.get(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Sessions"],
        summary: "List hunt sessions",
        security: [{ bearerAuth: [] }],
        querystring: SessionQuerySchema,
        response: {
          200: PaginatedSessionListSchema,
        },
      },
    },
    async (request) => {
      const useCase = new ListSessionsUseCase(sessionRepo, characterRepo);
      return useCase.execute(request.user.sub, request.query);
    },
  );

  // GET /api/v1/sessions/active (User - JWT auth)
  app.get(
    "/active",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Sessions"],
        summary: "Get all active sessions",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(SessionSchema),
        },
      },
    },
    async (request) => {
      const useCase = new GetActiveSessionsUseCase(sessionRepo, characterRepo);
      return useCase.execute(request.user.sub);
    },
  );

  // GET /api/v1/sessions/:id (User - JWT auth)
  app.get(
    "/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Sessions"],
        summary: "Get a specific session",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: SessionSchema,
        },
      },
    },
    async (request) => {
      const useCase = new GetSessionUseCase(sessionRepo, characterRepo);
      return useCase.execute(request.user.sub, request.params.id);
    },
  );

  // GET /api/v1/sessions/:id/positions (User - JWT auth)
  app.get(
    "/:id/positions",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Sessions"],
        summary: "Get position trail for a session",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid(),
        }),
        querystring: PositionLogQuerySchema,
        response: {
          200: PositionLogListSchema,
        },
      },
    },
    async (request) => {
      const session = await sessionRepo.findOne({
        where: { id: request.params.id },
        relations: ["character"],
      });

      if (!session || session.character.userId !== request.user.sub) {
        throw new NotFoundError("Session not found");
      }

      const positions = await positionLogRepo.find({
        where: { sessionId: request.params.id },
        order: { recordedAt: "ASC" },
        take: request.query.limit,
      });

      return positions.map((p) => ({
        x: p.x,
        y: p.y,
        z: p.z,
        recordedAt: p.recordedAt.toISOString(),
      }));
    },
  );

  // PATCH /api/v1/sessions/:id (Bot - API Key auth)
  app.patch(
    "/:id",
    {
      onRequest: [app.authenticateApiKey],
      schema: {
        tags: ["Sessions"],
        summary: "Update a session (Bot)",
        security: [{ apiKeyAuth: [] }],
        params: z.object({
          id: z.string().uuid(),
        }),
        body: UpdateSessionSchema,
        response: {
          200: SessionSchema,
        },
      },
    },
    async (request) => {
      const apiKey = (request as FastifyRequest & { apiKey: ApiKeyPayload }).apiKey;
      const useCase = new UpdateSessionUseCase(sessionRepo, characterRepo);
      const result = await useCase.execute(apiKey.userId, request.params.id, request.body);

      const isSessionEnding = request.body.status === "completed" || request.body.status === "crashed";
      const discordQueue = getDiscordNotificationQueue();
      if (discordQueue && isSessionEnding) {
        await discordQueue.add("notification", {
          userId: apiKey.userId,
          sessionId: request.params.id,
          notificationType: "sessionEnded",
          data: {
            characterName: result.characterName,
            duration: result.duration,
            totalKills: result.totalKills,
            xpPerHour: result.xpPerHour,
            totalLootValue: result.totalLootValue,
            huntLocation: result.huntLocation,
          },
        });
      }

      return result;
    },
  );
};
