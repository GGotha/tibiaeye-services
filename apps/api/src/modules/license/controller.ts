import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { LicenseKeyEntity } from "../../entities/license-key.entity.js";
import { SubscriptionEntity } from "../../entities/subscription.entity.js";
import {
  ValidateLicenseSchema,
  ValidateLicenseResponseSchema,
  UserLicenseSchema,
  RegenerateLicenseResponseSchema,
} from "./schemas.js";
import { ValidateLicenseUseCase } from "./use-cases/validate-license.use-case.js";
import { GetUserLicenseUseCase } from "./use-cases/get-user-license.use-case.js";
import { GenerateLicenseUseCase } from "./use-cases/generate-license.use-case.js";
import { AppError } from "../../shared/errors/index.js";

export const licenseController: FastifyPluginAsyncZod = async (app) => {
  const licenseKeyRepo = app.getRepository(LicenseKeyEntity);
  const subscriptionRepo = app.getRepository(SubscriptionEntity);

  // POST /api/v1/license/validate (Public - for bot)
  app.post(
    "/validate",
    {
      schema: {
        tags: ["License"],
        summary: "Validate a license key (Bot)",
        body: ValidateLicenseSchema,
        response: {
          200: ValidateLicenseResponseSchema,
        },
      },
    },
    async (request) => {
      const useCase = new ValidateLicenseUseCase(licenseKeyRepo);
      return useCase.execute(request.body);
    },
  );

  // GET /api/v1/license (User - JWT auth)
  app.get(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["License"],
        summary: "Get current user license info",
        description: "Returns license info without exposing the key",
        security: [{ bearerAuth: [] }],
        response: {
          200: UserLicenseSchema.nullable(),
        },
      },
    },
    async (request) => {
      const useCase = new GetUserLicenseUseCase(licenseKeyRepo, subscriptionRepo);
      return useCase.execute(request.user.sub);
    },
  );

  // POST /api/v1/license/regenerate (User - JWT auth)
  app.post(
    "/regenerate",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["License"],
        summary: "Regenerate license key (revokes old key)",
        security: [{ bearerAuth: [] }],
        response: {
          200: RegenerateLicenseResponseSchema,
        },
      },
    },
    async (request) => {
      const userId = request.user.sub;

      const subscription = await subscriptionRepo.findOne({
        where: { userId, status: "active" },
      });

      if (!subscription) {
        throw new AppError("No active subscription found");
      }

      const useCase = new GenerateLicenseUseCase(licenseKeyRepo);
      const result = await useCase.execute({
        userId,
        subscriptionId: subscription.id,
      });

      return { licenseKey: result.licenseKey };
    },
  );
};
