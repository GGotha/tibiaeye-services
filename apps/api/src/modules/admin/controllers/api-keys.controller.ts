import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import {
  UuidParamSchema,
  ApiKeyListQuerySchema,
  PaginatedApiKeysSchema,
} from "../schemas.js";
import { ListApiKeysUseCase } from "../use-cases/list-api-keys.use-case.js";
import { RevokeApiKeyUseCase } from "../use-cases/revoke-api-key.use-case.js";

export const adminApiKeysController: FastifyPluginAsyncZod = async (app) => {
  const licenseKeyRepo = app.getRepository(LicenseKeyEntity);

  // GET /api-keys
  app.get(
    "/",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - API Keys"],
        summary: "List all API keys",
        security: [{ bearerAuth: [] }],
        querystring: ApiKeyListQuerySchema,
        response: { 200: PaginatedApiKeysSchema },
      },
    },
    async (request) => {
      const useCase = new ListApiKeysUseCase(licenseKeyRepo);
      return useCase.execute(request.query);
    },
  );

  // POST /api-keys/:id/revoke
  app.post(
    "/:id/revoke",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - API Keys"],
        summary: "Revoke an API key",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
      },
    },
    async (request, reply) => {
      const useCase = new RevokeApiKeyUseCase(licenseKeyRepo);
      await useCase.execute(request.params.id);
      return reply.status(204).send();
    },
  );
};
