import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { LicenseKeyEntity } from "../../../entities/license-key.entity.js";
import { SubscriptionEntity } from "../../../entities/subscription.entity.js";
import {
  UuidParamSchema,
  LicenseListQuerySchema,
  PaginatedLicensesSchema,
  LicenseStatsSchema,
  LicenseSchema,
  RevokeLicenseBodySchema,
  ExtendLicenseBodySchema,
  BulkExtendBodySchema,
  BulkExtendResponseSchema,
} from "../schemas.js";
import { ListLicensesUseCase } from "../use-cases/list-licenses.use-case.js";
import { GetLicenseStatsUseCase } from "../use-cases/get-license-stats.use-case.js";
import { RevokeLicenseUseCase } from "../use-cases/revoke-license.use-case.js";
import { ExtendLicenseUseCase } from "../use-cases/extend-license.use-case.js";
import { BulkExtendLicensesUseCase } from "../use-cases/bulk-extend-licenses.use-case.js";

export const adminLicensesController: FastifyPluginAsyncZod = async (app) => {
  const licenseKeyRepo = app.getRepository(LicenseKeyEntity);
  const subscriptionRepo = app.getRepository(SubscriptionEntity);

  // GET /licenses
  app.get(
    "/",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Licenses"],
        summary: "List all licenses",
        security: [{ bearerAuth: [] }],
        querystring: LicenseListQuerySchema,
        response: { 200: PaginatedLicensesSchema },
      },
    },
    async (request) => {
      const useCase = new ListLicensesUseCase(licenseKeyRepo);
      return useCase.execute(request.query);
    },
  );

  // GET /licenses/stats
  app.get(
    "/stats",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Licenses"],
        summary: "Get license statistics",
        security: [{ bearerAuth: [] }],
        response: { 200: LicenseStatsSchema },
      },
    },
    async () => {
      const useCase = new GetLicenseStatsUseCase(licenseKeyRepo, subscriptionRepo);
      return useCase.execute();
    },
  );

  // POST /licenses/:id/revoke
  app.post(
    "/:id/revoke",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Licenses"],
        summary: "Revoke a license",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        body: RevokeLicenseBodySchema,
        response: { 200: LicenseSchema },
      },
    },
    async (request) => {
      const useCase = new RevokeLicenseUseCase(licenseKeyRepo);
      return useCase.execute(request.params.id, request.body.reason);
    },
  );

  // POST /licenses/:id/extend
  app.post(
    "/:id/extend",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Licenses"],
        summary: "Extend a license",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        body: ExtendLicenseBodySchema,
        response: { 200: LicenseSchema },
      },
    },
    async (request) => {
      const useCase = new ExtendLicenseUseCase(licenseKeyRepo, subscriptionRepo);
      return useCase.execute(request.params.id, request.body.days);
    },
  );

  // POST /licenses/bulk-extend
  app.post(
    "/bulk-extend",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Licenses"],
        summary: "Bulk extend licenses",
        security: [{ bearerAuth: [] }],
        body: BulkExtendBodySchema,
        response: { 200: BulkExtendResponseSchema },
      },
    },
    async (request) => {
      const useCase = new BulkExtendLicensesUseCase(licenseKeyRepo, subscriptionRepo);
      return useCase.execute(request.body.ids, request.body.days);
    },
  );
};
