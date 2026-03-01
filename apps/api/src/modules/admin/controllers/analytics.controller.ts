import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { UserEntity } from "../../../entities/user.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { PlanEntity } from "../../../entities/plan.entity.js";
import {
  FullPlatformStatsSchema,
  RevenueDataSchema,
  UsageDataSchema,
  BotsOnlineSchema,
  AnalyticsPeriodQuerySchema,
} from "../schemas.js";
import { GetPlatformStatsUseCase } from "../use-cases/get-platform-stats.use-case.js";
import { GetRevenueDataUseCase } from "../use-cases/get-revenue-data.use-case.js";
import { GetUsageDataUseCase } from "../use-cases/get-usage-data.use-case.js";
import { GetBotsOnlineUseCase } from "../use-cases/get-bots-online.use-case.js";

export const adminAnalyticsController: FastifyPluginAsyncZod = async (app) => {
  const userRepo = app.getRepository(UserEntity);
  const subscriptionRepo = app.getRepository(SubscriptionEntity);
  const sessionRepo = app.getRepository(SessionEntity);
  const characterRepo = app.getRepository(CharacterEntity);
  const licenseKeyRepo = app.getRepository(LicenseKeyEntity);
  const planRepo = app.getRepository(PlanEntity);

  // GET /analytics/platform
  app.get(
    "/platform",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Analytics"],
        summary: "Get platform-wide statistics",
        security: [{ bearerAuth: [] }],
        response: { 200: FullPlatformStatsSchema },
      },
    },
    async () => {
      const useCase = new GetPlatformStatsUseCase(
        userRepo,
        subscriptionRepo,
        sessionRepo,
        characterRepo,
        licenseKeyRepo,
        planRepo,
      );
      return useCase.execute();
    },
  );

  // GET /analytics/revenue
  app.get(
    "/revenue",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Analytics"],
        summary: "Get revenue data over time",
        security: [{ bearerAuth: [] }],
        querystring: AnalyticsPeriodQuerySchema,
        response: { 200: z.array(RevenueDataSchema) },
      },
    },
    async (request) => {
      const useCase = new GetRevenueDataUseCase(subscriptionRepo);
      return useCase.execute(request.query.period);
    },
  );

  // GET /analytics/usage
  app.get(
    "/usage",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Analytics"],
        summary: "Get usage data over time",
        security: [{ bearerAuth: [] }],
        querystring: AnalyticsPeriodQuerySchema,
        response: { 200: z.array(UsageDataSchema) },
      },
    },
    async (request) => {
      const useCase = new GetUsageDataUseCase(sessionRepo);
      return useCase.execute(request.query.period);
    },
  );

  // GET /analytics/bots-online
  app.get(
    "/bots-online",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Analytics"],
        summary: "Get current bots online count",
        security: [{ bearerAuth: [] }],
        response: { 200: BotsOnlineSchema },
      },
    },
    async () => {
      const useCase = new GetBotsOnlineUseCase(sessionRepo);
      return useCase.execute();
    },
  );
};
