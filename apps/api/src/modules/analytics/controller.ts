import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ExperienceSnapshotEntity } from "../../entities/experience-snapshot.entity.js";
import { GameEventEntity } from "../../entities/game-event.entity.js";
import { KillEntity } from "../../entities/kill.entity.js";
import { LootEntity } from "../../entities/loot.entity.js";
import { SessionEntity } from "../../entities/session.entity.js";
import { CharacterEntity } from "../../entities/character.entity.js";
import {
  AnalyticsQuerySchema,
  CompareDataSchema,
  CompareQuerySchema,
  ExperienceHourlyListSchema,
  GameEventListSchema,
  KillsByCreatureListSchema,
  LootSummarySchema,
  ProfitDataSchema,
  ProfitQuerySchema,
} from "./schemas.js";
import { GetCompareUseCase } from "./use-cases/get-compare.use-case.js";
import { GetExperienceHourlyUseCase } from "./use-cases/get-experience-hourly.use-case.js";
import { GetKillsByCreatureUseCase } from "./use-cases/get-kills-by-creature.use-case.js";
import { GetLootSummaryUseCase } from "./use-cases/get-loot-summary.use-case.js";
import { GetProfitUseCase } from "./use-cases/get-profit.use-case.js";

export const analyticsController: FastifyPluginAsyncZod = async (app) => {
  const experienceRepo = app.getRepository(ExperienceSnapshotEntity);
  const killRepo = app.getRepository(KillEntity);
  const lootRepo = app.getRepository(LootEntity);
  const sessionRepo = app.getRepository(SessionEntity);
  const characterRepo = app.getRepository(CharacterEntity);
  const gameEventRepo = app.getRepository(GameEventEntity);

  // GET /api/v1/analytics/experience/hourly
  app.get(
    "/experience/hourly",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Get hourly experience breakdown",
        security: [{ bearerAuth: [] }],
        querystring: AnalyticsQuerySchema,
        response: {
          200: ExperienceHourlyListSchema,
        },
      },
    },
    async (request) => {
      const useCase = new GetExperienceHourlyUseCase(experienceRepo, sessionRepo, characterRepo);
      return useCase.execute(request.user.sub, request.query);
    },
  );

  // GET /api/v1/analytics/kills/by-creature
  app.get(
    "/kills/by-creature",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Get kills grouped by creature",
        security: [{ bearerAuth: [] }],
        querystring: AnalyticsQuerySchema,
        response: {
          200: KillsByCreatureListSchema,
        },
      },
    },
    async (request) => {
      const useCase = new GetKillsByCreatureUseCase(killRepo, sessionRepo, characterRepo);
      return useCase.execute(request.user.sub, request.query);
    },
  );

  // GET /api/v1/analytics/loot/summary
  app.get(
    "/loot/summary",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Get loot summary",
        security: [{ bearerAuth: [] }],
        querystring: AnalyticsQuerySchema,
        response: {
          200: LootSummarySchema,
        },
      },
    },
    async (request) => {
      const useCase = new GetLootSummaryUseCase(lootRepo, sessionRepo, characterRepo);
      return useCase.execute(request.user.sub, request.query);
    },
  );

  // GET /api/v1/analytics/events
  app.get(
    "/events",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Get game events (deaths, level ups, refills)",
        security: [{ bearerAuth: [] }],
        querystring: AnalyticsQuerySchema,
        response: { 200: GameEventListSchema },
      },
    },
    async (request) => {
      const query = request.query;
      const where: Record<string, unknown> = {};

      if (query.sessionId) {
        where.sessionId = query.sessionId;
      }

      const events = await gameEventRepo.find({
        where,
        order: { createdAt: "DESC" },
        take: 100,
      });

      return events.map((e) => ({
        id: e.id,
        type: e.type,
        data: e.data,
        createdAt: e.createdAt.toISOString(),
      }));
    },
  );

  // GET /api/v1/analytics/profit
  app.get(
    "/profit",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Get profit analysis",
        security: [{ bearerAuth: [] }],
        querystring: ProfitQuerySchema,
        response: { 200: ProfitDataSchema },
      },
    },
    async (request) => {
      const useCase = new GetProfitUseCase(sessionRepo, gameEventRepo, characterRepo);
      return useCase.execute(request.user.sub, request.query);
    },
  );

  // GET /api/v1/analytics/compare
  app.get(
    "/compare",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Compare multiple sessions",
        security: [{ bearerAuth: [] }],
        querystring: CompareQuerySchema,
        response: { 200: CompareDataSchema },
      },
    },
    async (request) => {
      const useCase = new GetCompareUseCase(sessionRepo, characterRepo);
      return useCase.execute(request.user.sub, request.query);
    },
  );
};
