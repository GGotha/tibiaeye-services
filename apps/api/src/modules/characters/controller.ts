import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { CharacterEntity } from "../../entities/character.entity.js";
import { SessionEntity } from "../../entities/session.entity.js";
import { TibiaDataCharacterLookupProvider } from "../../providers/character-lookup/tibiadata-character-lookup.provider.js";
import {
  CreateCharacterSchema,
  CharacterSchema,
  CharacterListSchema,
  MessageResponseSchema,
} from "./schemas.js";
import { PaginatedSessionListSchema, SessionQuerySchema } from "../sessions/schemas.js";
import { CreateCharacterUseCase } from "./use-cases/create-character.use-case.js";
import { ListCharactersUseCase } from "./use-cases/list-characters.use-case.js";
import { DeleteCharacterUseCase } from "./use-cases/delete-character.use-case.js";
import { GetCharacterUseCase } from "./use-cases/get-character.use-case.js";
import { GetCharacterSessionsUseCase } from "./use-cases/get-character-sessions.use-case.js";

export const charactersController: FastifyPluginAsyncZod = async (app) => {
  const characterRepo = app.getRepository(CharacterEntity);
  const sessionRepo = app.getRepository(SessionEntity);
  const characterLookup = new TibiaDataCharacterLookupProvider();

  // POST /api/v1/characters
  app.post(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Characters"],
        summary: "Create a new character",
        security: [{ bearerAuth: [] }],
        body: CreateCharacterSchema,
        response: {
          201: CharacterSchema,
        },
      },
    },
    async (request, reply) => {
      const useCase = new CreateCharacterUseCase(characterRepo, characterLookup);
      const result = await useCase.execute(request.user.sub, request.body);
      return reply.status(201).send(result);
    },
  );

  // GET /api/v1/characters
  app.get(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Characters"],
        summary: "List all characters for the current user",
        security: [{ bearerAuth: [] }],
        response: {
          200: CharacterListSchema,
        },
      },
    },
    async (request) => {
      const useCase = new ListCharactersUseCase(characterRepo);
      return useCase.execute(request.user.sub);
    },
  );

  // GET /api/v1/characters/:id
  app.get(
    "/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Characters"],
        summary: "Get a character by ID",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: CharacterSchema,
        },
      },
    },
    async (request) => {
      const useCase = new GetCharacterUseCase(characterRepo);
      const character = await useCase.execute(request.user.sub, request.params.id);
      return {
        ...character,
        createdAt: character.createdAt.toISOString(),
        updatedAt: character.updatedAt.toISOString(),
      };
    },
  );

  // GET /api/v1/characters/:id/sessions
  app.get(
    "/:id/sessions",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Characters"],
        summary: "Get sessions for a character",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid(),
        }),
        querystring: SessionQuerySchema.omit({ characterId: true }),
        response: {
          200: PaginatedSessionListSchema,
        },
      },
    },
    async (request) => {
      const useCase = new GetCharacterSessionsUseCase(characterRepo, sessionRepo);
      const { sessions, total, characterName } = await useCase.execute(
        request.user.sub,
        request.params.id,
        {
          limit: request.query.limit,
          page: request.query.page,
          status: request.query.status,
        },
      );
      const totalPages = Math.ceil(total / request.query.limit);
      return {
        data: sessions.map((session) => ({
          id: session.id,
          characterId: session.characterId,
          characterName,
          huntLocation: session.huntLocation,
          status: session.status,
          startedAt: session.startedAt.toISOString(),
          endedAt: session.endedAt?.toISOString() ?? null,
          initialLevel: session.initialLevel,
          initialExperience: session.initialExperience,
          finalLevel: session.finalLevel,
          finalExperience: session.finalExperience,
          totalKills: session.totalKills,
          totalExperience: session.totalExperience,
          totalLootValue: session.totalLootValue,
          duration: session.duration,
          xpPerHour: session.xpPerHour,
        })),
        total,
        page: request.query.page,
        limit: request.query.limit,
        totalPages,
      };
    },
  );

  // DELETE /api/v1/characters/:id
  app.delete(
    "/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Characters"],
        summary: "Delete a character",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: MessageResponseSchema,
        },
      },
    },
    async (request) => {
      const useCase = new DeleteCharacterUseCase(characterRepo);
      return useCase.execute(request.user.sub, request.params.id);
    },
  );
};
