import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import {
  UuidParamSchema,
  SubscriptionListQuerySchema,
  PaginatedSubscriptionsSchema,
  SubscriptionSchema,
  CancelSubscriptionBodySchema,
  ExtendSubscriptionBodySchema,
} from "../schemas.js";
import { ListSubscriptionsUseCase } from "../use-cases/list-subscriptions.use-case.js";
import { CancelSubscriptionUseCase } from "../use-cases/cancel-subscription.use-case.js";
import { ExtendSubscriptionUseCase } from "../use-cases/extend-subscription.use-case.js";

export const adminSubscriptionsController: FastifyPluginAsyncZod = async (app) => {
  const subscriptionRepo = app.getRepository(SubscriptionEntity);

  // GET /subscriptions
  app.get(
    "/",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Subscriptions"],
        summary: "List all subscriptions",
        security: [{ bearerAuth: [] }],
        querystring: SubscriptionListQuerySchema,
        response: { 200: PaginatedSubscriptionsSchema },
      },
    },
    async (request) => {
      const useCase = new ListSubscriptionsUseCase(subscriptionRepo);
      return useCase.execute(request.query);
    },
  );

  // POST /subscriptions/:id/cancel
  app.post(
    "/:id/cancel",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Subscriptions"],
        summary: "Cancel a subscription",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        body: CancelSubscriptionBodySchema,
        response: { 200: SubscriptionSchema },
      },
    },
    async (request) => {
      const useCase = new CancelSubscriptionUseCase(subscriptionRepo);
      return useCase.execute(request.params.id, request.body.immediate);
    },
  );

  // POST /subscriptions/:id/extend
  app.post(
    "/:id/extend",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Subscriptions"],
        summary: "Extend a subscription",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        body: ExtendSubscriptionBodySchema,
        response: { 200: SubscriptionSchema },
      },
    },
    async (request) => {
      const useCase = new ExtendSubscriptionUseCase(subscriptionRepo);
      return useCase.execute(request.params.id, request.body.days);
    },
  );
};
