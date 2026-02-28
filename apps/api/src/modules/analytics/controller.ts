import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ExperienceSnapshotEntity } from "../../entities/experience-snapshot.entity.js";
import { GameEventEntity } from "../../entities/game-event.entity.js";
import { KillEntity } from "../../entities/kill.entity.js";
import { LootEntity } from "../../entities/loot.entity.js";
import { SessionEntity } from "../../entities/session.entity.js";
import { CharacterEntity } from "../../entities/character.entity.js";
import { PositionLogEntity } from "../../entities/position-log.entity.js";
import {
  AnalyticsQuerySchema,
  CompareDataSchema,
  CompareQuerySchema,
  ExperienceHourlyResponseSchema,
  GameEventListSchema,
  HuntAnalyticsListSchema,
  KillsByCreatureListSchema,
  KillsHeatmapListSchema,
  LootSummarySchema,
  PositionHeatmapListSchema,
  PositionHeatmapQuerySchema,
  ProfitDataSchema,
  ProfitQuerySchema,
  TimelineQuerySchema,
  TimelineResponseSchema,
} from "./schemas.js";
import { GetCompareUseCase } from "./use-cases/get-compare.use-case.js";
import { GetExperienceHourlyUseCase } from "./use-cases/get-experience-hourly.use-case.js";
import { GetHuntAnalyticsUseCase } from "./use-cases/get-hunt-analytics.use-case.js";
import { GetKillsByCreatureUseCase } from "./use-cases/get-kills-by-creature.use-case.js";
import { GetKillsHeatmapUseCase } from "./use-cases/get-kills-heatmap.use-case.js";
import { GetLootSummaryUseCase } from "./use-cases/get-loot-summary.use-case.js";
import { GetPositionHeatmapUseCase } from "./use-cases/get-position-heatmap.use-case.js";
import { GetProfitUseCase } from "./use-cases/get-profit.use-case.js";

export const analyticsController: FastifyPluginAsyncZod = async (app) => {
  const experienceRepo = app.getRepository(ExperienceSnapshotEntity);
  const killRepo = app.getRepository(KillEntity);
  const lootRepo = app.getRepository(LootEntity);
  const sessionRepo = app.getRepository(SessionEntity);
  const characterRepo = app.getRepository(CharacterEntity);
  const gameEventRepo = app.getRepository(GameEventEntity);
  const positionLogRepo = app.getRepository(PositionLogEntity);

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
          200: ExperienceHourlyResponseSchema,
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

  // GET /api/v1/analytics/kills/heatmap
  app.get(
    "/kills/heatmap",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Get kills heatmap data",
        security: [{ bearerAuth: [] }],
        querystring: AnalyticsQuerySchema,
        response: {
          200: KillsHeatmapListSchema,
        },
      },
    },
    async (request) => {
      const useCase = new GetKillsHeatmapUseCase(killRepo, sessionRepo, characterRepo);
      return useCase.execute(request.user.sub, request.query);
    },
  );

  // GET /api/v1/analytics/positions/heatmap
  app.get(
    "/positions/heatmap",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Get position visit heatmap data",
        security: [{ bearerAuth: [] }],
        querystring: PositionHeatmapQuerySchema,
        response: {
          200: PositionHeatmapListSchema,
        },
      },
    },
    async (request) => {
      const useCase = new GetPositionHeatmapUseCase(positionLogRepo, sessionRepo, characterRepo);
      return useCase.execute(request.user.sub, request.query);
    },
  );

  // GET /api/v1/analytics/hunts
  app.get(
    "/hunts",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Get hunt analytics by location",
        security: [{ bearerAuth: [] }],
        response: {
          200: HuntAnalyticsListSchema,
        },
      },
    },
    async (request) => {
      const useCase = new GetHuntAnalyticsUseCase(sessionRepo, characterRepo);
      return useCase.execute(request.user.sub);
    },
  );

  // GET /api/v1/analytics/timeline
  app.get(
    "/timeline",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Get unified timeline of all session events",
        security: [{ bearerAuth: [] }],
        querystring: TimelineQuerySchema,
        response: { 200: TimelineResponseSchema },
      },
    },
    async (request) => {
      const { sessionId, limit, cursor } = request.query;
      const userId = request.user.sub;

      // Verify session ownership
      const session = await sessionRepo.findOne({
        where: { id: sessionId },
        relations: ["character"],
      });
      if (!session || session.character.userId !== userId) {
        return { events: [], nextCursor: null };
      }

      const cursorDate = cursor ? new Date(cursor) : new Date();

      // Query kills, loot, and game_events in parallel
      const [kills, loots, gameEvents] = await Promise.all([
        killRepo
          .createQueryBuilder("k")
          .where("k.sessionId = :sessionId", { sessionId })
          .andWhere("k.killedAt < :cursor", { cursor: cursorDate })
          .orderBy("k.killedAt", "DESC")
          .take(limit)
          .getMany(),
        lootRepo
          .createQueryBuilder("l")
          .where("l.sessionId = :sessionId", { sessionId })
          .andWhere("l.lootedAt < :cursor", { cursor: cursorDate })
          .orderBy("l.lootedAt", "DESC")
          .take(limit)
          .getMany(),
        gameEventRepo
          .createQueryBuilder("e")
          .where("e.sessionId = :sessionId", { sessionId })
          .andWhere("e.createdAt < :cursor", { cursor: cursorDate })
          .orderBy("e.createdAt", "DESC")
          .take(limit)
          .getMany(),
      ]);

      // Merge into unified timeline
      const events: Array<{ type: string; timestamp: string; data: Record<string, unknown> | null }> = [];

      for (const kill of kills) {
        events.push({
          type: "kill",
          timestamp: kill.killedAt.toISOString(),
          data: {
            creatureName: kill.creatureName,
            experienceGained: kill.experienceGained,
          },
        });
      }

      for (const loot of loots) {
        events.push({
          type: "loot",
          timestamp: loot.lootedAt.toISOString(),
          data: {
            itemName: loot.itemName,
            quantity: loot.quantity,
            estimatedValue: loot.estimatedValue,
          },
        });
      }

      for (const event of gameEvents) {
        events.push({
          type: event.type,
          timestamp: event.createdAt.toISOString(),
          data: event.data as Record<string, unknown> | null,
        });
      }

      // Sort DESC by timestamp
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Paginate
      const paginated = events.slice(0, limit);
      const nextCursor = paginated.length === limit
        ? paginated[paginated.length - 1].timestamp
        : null;

      return { events: paginated, nextCursor };
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
