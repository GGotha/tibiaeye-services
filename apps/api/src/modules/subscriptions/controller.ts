import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { SubscriptionEntity } from "../../entities/subscription.entity.js";
import { PlanEntity } from "../../entities/plan.entity.js";
import { SubscriptionSchema, PlansListSchema, MessageResponseSchema } from "./schemas.js";
import { GetCurrentSubscriptionUseCase } from "./use-cases/get-current.use-case.js";
import { CancelSubscriptionUseCase } from "./use-cases/cancel.use-case.js";
import { GetPlansUseCase } from "./use-cases/get-plans.use-case.js";

export const subscriptionsController: FastifyPluginAsyncZod = async (app) => {
  const subscriptionRepo = app.getRepository(SubscriptionEntity);
  const planRepo = app.getRepository(PlanEntity);

  // GET /api/v1/subscriptions/plans (Public)
  app.get(
    "/plans",
    {
      schema: {
        tags: ["Subscriptions"],
        summary: "Get available subscription plans",
        response: {
          200: PlansListSchema,
        },
      },
    },
    async () => {
      const useCase = new GetPlansUseCase(planRepo);
      return useCase.execute();
    },
  );

  // GET /api/v1/subscriptions/current (User - JWT auth)
  app.get(
    "/current",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Subscriptions"],
        summary: "Get current user subscription",
        security: [{ bearerAuth: [] }],
        response: {
          200: SubscriptionSchema.nullable(),
        },
      },
    },
    async (request) => {
      const useCase = new GetCurrentSubscriptionUseCase(subscriptionRepo);
      return useCase.execute(request.user.sub);
    },
  );

  // POST /api/v1/subscriptions/cancel (User - JWT auth)
  app.post(
    "/cancel",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Subscriptions"],
        summary: "Cancel current subscription",
        description: "Marks subscription to cancel at period end",
        security: [{ bearerAuth: [] }],
        response: {
          200: MessageResponseSchema,
        },
      },
    },
    async (request) => {
      const useCase = new CancelSubscriptionUseCase(subscriptionRepo);
      return useCase.execute(request.user.sub);
    },
  );
};
