import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import crypto from "node:crypto";
import { SubscriptionEntity } from "../../entities/subscription.entity.js";
import { PlanEntity } from "../../entities/plan.entity.js";
import { UserEntity } from "../../entities/user.entity.js";
import { LicenseKeyEntity } from "../../entities/license-key.entity.js";
import { env } from "../../config/env.js";
import { UnauthorizedError } from "../../shared/errors/index.js";
import { WebhookPayloadSchema, WebhookResponseSchema } from "./schemas.js";
import { HandleWebhookUseCase } from "./use-cases/handle-webhook.use-case.js";

export const paymentsController: FastifyPluginAsyncZod = async (app) => {
  const subscriptionRepo = app.getRepository(SubscriptionEntity);
  const planRepo = app.getRepository(PlanEntity);
  const userRepo = app.getRepository(UserEntity);
  const licenseKeyRepo = app.getRepository(LicenseKeyEntity);

  // POST /api/v1/payments/webhook (Public - verified by secret)
  app.post(
    "/webhook",
    {
      schema: {
        tags: ["Payments"],
        summary: "Handle payment provider webhook",
        body: WebhookPayloadSchema,
        response: {
          200: WebhookResponseSchema,
        },
      },
    },
    async (request) => {
      // Verify webhook secret if configured
      if (env.WEBHOOK_SECRET) {
        const signature = request.headers["x-webhook-secret"] as string | undefined;

        if (!signature) {
          throw new UnauthorizedError("Missing webhook signature");
        }

        // Simple comparison (in production, use HMAC)
        const isValid = crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(env.WEBHOOK_SECRET),
        );

        if (!isValid) {
          throw new UnauthorizedError("Invalid webhook signature");
        }
      }

      const useCase = new HandleWebhookUseCase(
        subscriptionRepo,
        planRepo,
        userRepo,
        licenseKeyRepo,
        // Email service would be injected here in production
      );

      return useCase.execute(request.body);
    },
  );
};
