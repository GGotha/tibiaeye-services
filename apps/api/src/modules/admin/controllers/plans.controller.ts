import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { PlanEntity } from "../../../entities/plan.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import {
  UuidParamSchema,
  PlanSchema,
  CreatePlanBodySchema,
  UpdatePlanBodySchema,
} from "../schemas.js";
import { ListPlansUseCase } from "../use-cases/list-plans.use-case.js";
import { CreatePlanUseCase } from "../use-cases/create-plan.use-case.js";
import { UpdatePlanUseCase } from "../use-cases/update-plan.use-case.js";
import { DeactivatePlanUseCase } from "../use-cases/deactivate-plan.use-case.js";

export const adminPlansController: FastifyPluginAsyncZod = async (app) => {
  const planRepo = app.getRepository(PlanEntity);
  const subscriptionRepo = app.getRepository(SubscriptionEntity);

  // GET /plans
  app.get(
    "/",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Plans"],
        summary: "List all plans",
        security: [{ bearerAuth: [] }],
        response: { 200: z.array(PlanSchema) },
      },
    },
    async () => {
      const useCase = new ListPlansUseCase(planRepo, subscriptionRepo);
      return useCase.execute();
    },
  );

  // POST /plans
  app.post(
    "/",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Plans"],
        summary: "Create a plan",
        security: [{ bearerAuth: [] }],
        body: CreatePlanBodySchema,
        response: { 200: PlanSchema },
      },
    },
    async (request) => {
      const useCase = new CreatePlanUseCase(planRepo);
      return useCase.execute(request.body);
    },
  );

  // PATCH /plans/:id
  app.patch(
    "/:id",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Plans"],
        summary: "Update a plan",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        body: UpdatePlanBodySchema,
        response: { 200: PlanSchema },
      },
    },
    async (request) => {
      const useCase = new UpdatePlanUseCase(planRepo, subscriptionRepo);
      return useCase.execute(request.params.id, request.body);
    },
  );

  // POST /plans/:id/deactivate
  app.post(
    "/:id/deactivate",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Plans"],
        summary: "Deactivate a plan",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        response: { 200: PlanSchema },
      },
    },
    async (request) => {
      const useCase = new DeactivatePlanUseCase(planRepo, subscriptionRepo);
      return useCase.execute(request.params.id);
    },
  );
};
