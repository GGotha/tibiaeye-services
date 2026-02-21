import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { SessionEntity } from "../../entities/session.entity.js";
import { CharacterEntity } from "../../entities/character.entity.js";
import type { ApiKeyPayload } from "../../plugins/auth.plugin.js";
import {
  CreateSessionSchema,
  UpdateSessionSchema,
  SessionSchema,
  PaginatedSessionListSchema,
  SessionQuerySchema,
} from "./schemas.js";
import { CreateSessionUseCase } from "./use-cases/create-session.use-case.js";
import { ListSessionsUseCase } from "./use-cases/list-sessions.use-case.js";
import { GetSessionUseCase } from "./use-cases/get-session.use-case.js";
import { UpdateSessionUseCase } from "./use-cases/update-session.use-case.js";
import { GetActiveSessionUseCase } from "./use-cases/get-active-session.use-case.js";

export const sessionsController: FastifyPluginAsyncZod = async (app) => {
  const sessionRepo = app.getRepository(SessionEntity);
  const characterRepo = app.getRepository(CharacterEntity);

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
        summary: "Get current active session",
        security: [{ bearerAuth: [] }],
        response: {
          200: SessionSchema.nullable(),
        },
      },
    },
    async (request) => {
      const useCase = new GetActiveSessionUseCase(sessionRepo, characterRepo);
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
      return useCase.execute(apiKey.userId, request.params.id, request.body);
    },
  );
};
