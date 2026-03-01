import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { UserEntity } from "../../../entities/user.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import { PlanEntity } from "../../../entities/plan.entity.js";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import {
  UuidParamSchema,
  UserListQuerySchema,
  PaginatedUsersResponseSchema,
  UserDetailSchema,
  UserSchema,
  SuspendUserBodySchema,
  BanUserBodySchema,
  GivePlanSchema,
  LicenseSchema,
} from "../schemas.js";
import { ListUsersUseCase } from "../use-cases/list-users.use-case.js";
import { GetUserUseCase } from "../use-cases/get-user.use-case.js";
import { SuspendUserUseCase } from "../use-cases/suspend-user.use-case.js";
import { BanUserUseCase } from "../use-cases/ban-user.use-case.js";
import { DeleteUserUseCase } from "../use-cases/delete-user.use-case.js";
import { GivePlanUseCase } from "../use-cases/give-plan.use-case.js";

export const adminUsersController: FastifyPluginAsyncZod = async (app) => {
  const userRepo = app.getRepository(UserEntity);
  const subscriptionRepo = app.getRepository(SubscriptionEntity);
  const sessionRepo = app.getRepository(SessionEntity);
  const characterRepo = app.getRepository(CharacterEntity);
  const planRepo = app.getRepository(PlanEntity);
  const licenseKeyRepo = app.getRepository(LicenseKeyEntity);

  // GET /users
  app.get(
    "/",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Users"],
        summary: "List all users (paginated)",
        security: [{ bearerAuth: [] }],
        querystring: UserListQuerySchema,
        response: { 200: PaginatedUsersResponseSchema },
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

  // GET /users/:id
  app.get(
    "/:id",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Users"],
        summary: "Get user detail",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        response: { 200: UserDetailSchema },
      },
    },
    async (request) => {
      const useCase = new GetUserUseCase(
        userRepo,
        subscriptionRepo,
        characterRepo,
        sessionRepo,
        licenseKeyRepo,
        planRepo,
      );
      return useCase.execute(request.params.id);
    },
  );

  // POST /users/:id/suspend
  app.post(
    "/:id/suspend",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Users"],
        summary: "Suspend a user",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        body: SuspendUserBodySchema,
        response: { 200: UserSchema },
      },
    },
    async (request) => {
      const useCase = new SuspendUserUseCase(
        userRepo,
        licenseKeyRepo,
        subscriptionRepo,
        characterRepo,
        sessionRepo,
      );
      return useCase.execute(request.params.id, true, request.body.reason);
    },
  );

  // POST /users/:id/unsuspend
  app.post(
    "/:id/unsuspend",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Users"],
        summary: "Unsuspend a user",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        response: { 200: UserSchema },
      },
    },
    async (request) => {
      const useCase = new SuspendUserUseCase(
        userRepo,
        licenseKeyRepo,
        subscriptionRepo,
        characterRepo,
        sessionRepo,
      );
      return useCase.execute(request.params.id, false);
    },
  );

  // POST /users/:id/ban
  app.post(
    "/:id/ban",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Users"],
        summary: "Ban a user",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        body: BanUserBodySchema,
        response: { 200: UserSchema },
      },
    },
    async (request) => {
      const useCase = new BanUserUseCase(
        userRepo,
        licenseKeyRepo,
        subscriptionRepo,
        characterRepo,
        sessionRepo,
      );
      return useCase.execute(request.params.id, request.body.reason);
    },
  );

  // POST /users/:id/give-plan
  app.post(
    "/:id/give-plan",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Users"],
        summary: "Give a subscription plan to a user",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        body: GivePlanSchema,
        response: { 200: LicenseSchema },
      },
    },
    async (request) => {
      const useCase = new GivePlanUseCase(
        userRepo,
        subscriptionRepo,
        planRepo,
        licenseKeyRepo,
      );
      const result = await useCase.execute(request.params.id, request.body);

      // Return License-like object that the backoffice expects
      const user = await userRepo.findOne({ where: { id: request.params.id } });
      const lk = await licenseKeyRepo.findOne({
        where: { id: result.id },
        relations: ["subscription"],
      });

      return {
        id: result.id,
        userId: request.params.id,
        userEmail: user?.email || "",
        userName: user?.name || null,
        keyPrefix: result.keyPrefix,
        status: "active" as const,
        expiresAt: lk?.subscription?.currentPeriodEnd?.toISOString() || new Date().toISOString(),
        createdAt: lk?.createdAt?.toISOString() || new Date().toISOString(),
        lastUsedAt: null,
        activationsCount: 0,
        maxActivations: 1,
      };
    },
  );

  // DELETE /users/:id
  app.delete(
    "/:id",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Users"],
        summary: "Delete a user",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
      },
    },
    async (request, reply) => {
      const useCase = new DeleteUserUseCase(userRepo);
      await useCase.execute(request.params.id);
      return reply.status(204).send();
    },
  );
};
