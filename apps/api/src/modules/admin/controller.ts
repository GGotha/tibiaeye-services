import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { UserEntity } from "../../entities/user.entity.js";
import { SubscriptionEntity } from "../../entities/subscription.entity.js";
import { SessionEntity } from "../../entities/session.entity.js";
import { CharacterEntity } from "../../entities/character.entity.js";
import { PlanEntity } from "../../entities/plan.entity.js";
import { LicenseKeyEntity } from "../../entities/license-key.entity.js";
import {
  PlatformStatsSchema,
  AdminUserListSchema,
  AdminUserSchema,
  UserListQuerySchema,
  GivePlanSchema,
  MessageResponseSchema,
} from "./schemas.js";
import { GetPlatformStatsUseCase } from "./use-cases/get-platform-stats.use-case.js";
import { ListUsersUseCase } from "./use-cases/list-users.use-case.js";
import { GetUserUseCase } from "./use-cases/get-user.use-case.js";
import { SuspendUserUseCase } from "./use-cases/suspend-user.use-case.js";
import { GivePlanUseCase } from "./use-cases/give-plan.use-case.js";

export const adminController: FastifyPluginAsyncZod = async (app) => {
  const userRepo = app.getRepository(UserEntity);
  const subscriptionRepo = app.getRepository(SubscriptionEntity);
  const sessionRepo = app.getRepository(SessionEntity);
  const characterRepo = app.getRepository(CharacterEntity);
  const planRepo = app.getRepository(PlanEntity);
  const licenseKeyRepo = app.getRepository(LicenseKeyEntity);

  // GET /api/v1/admin/analytics/platform
  app.get(
    "/analytics/platform",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin"],
        summary: "Get platform-wide statistics",
        security: [{ bearerAuth: [] }],
        response: {
          200: PlatformStatsSchema,
        },
      },
    },
    async () => {
      const useCase = new GetPlatformStatsUseCase(
        userRepo,
        subscriptionRepo,
        sessionRepo,
        characterRepo,
      );
      return useCase.execute();
    },
  );

  // GET /api/v1/admin/users
  app.get(
    "/users",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin"],
        summary: "List all users",
        security: [{ bearerAuth: [] }],
        querystring: UserListQuerySchema,
        response: {
          200: AdminUserListSchema,
        },
      },
    },
    async (request) => {
      const useCase = new ListUsersUseCase(
        userRepo,
        subscriptionRepo,
        characterRepo,
        sessionRepo,
      );
      return useCase.execute(request.query);
    },
  );

  // GET /api/v1/admin/users/:id
  app.get(
    "/users/:id",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin"],
        summary: "Get user details",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: AdminUserSchema,
        },
      },
    },
    async (request) => {
      const useCase = new GetUserUseCase(
        userRepo,
        subscriptionRepo,
        characterRepo,
        sessionRepo,
      );
      return useCase.execute(request.params.id);
    },
  );

  // PATCH /api/v1/admin/users/:id/suspend
  app.patch(
    "/users/:id/suspend",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin"],
        summary: "Suspend a user",
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
      const useCase = new SuspendUserUseCase(userRepo, licenseKeyRepo);
      return useCase.execute(request.params.id, true);
    },
  );

  // PATCH /api/v1/admin/users/:id/unsuspend
  app.patch(
    "/users/:id/unsuspend",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin"],
        summary: "Unsuspend a user",
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
      const useCase = new SuspendUserUseCase(userRepo, licenseKeyRepo);
      return useCase.execute(request.params.id, false);
    },
  );

  // POST /api/v1/admin/users/:id/give-plan
  app.post(
    "/users/:id/give-plan",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin"],
        summary: "Give a subscription plan to a user",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid(),
        }),
        body: GivePlanSchema,
        response: {
          200: z.object({
            message: z.string(),
            licenseKey: z.string(),
          }),
        },
      },
    },
    async (request) => {
      const useCase = new GivePlanUseCase(
        userRepo,
        subscriptionRepo,
        planRepo,
        licenseKeyRepo,
      );
      return useCase.execute(request.params.id, request.body);
    },
  );
};
