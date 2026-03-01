import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { FeatureFlagEntity } from "../../../entities/feature-flag.entity.js";
import { SystemSettingEntity } from "../../../entities/system-setting.entity.js";
import {
  UuidParamSchema,
  FeatureFlagSchema,
  SetFeatureFlagBodySchema,
  MaintenanceModeSchema,
} from "../schemas.js";
import { GetFeatureFlagsUseCase } from "../use-cases/get-feature-flags.use-case.js";
import { SetFeatureFlagUseCase } from "../use-cases/set-feature-flag.use-case.js";
import { GetMaintenanceUseCase } from "../use-cases/get-maintenance.use-case.js";
import { SetMaintenanceUseCase } from "../use-cases/set-maintenance.use-case.js";

export const adminSettingsController: FastifyPluginAsyncZod = async (app) => {
  const featureFlagRepo = app.getRepository(FeatureFlagEntity);
  const settingRepo = app.getRepository(SystemSettingEntity);

  // GET /settings/feature-flags
  app.get(
    "/feature-flags",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Settings"],
        summary: "Get all feature flags",
        security: [{ bearerAuth: [] }],
        response: { 200: z.array(FeatureFlagSchema) },
      },
    },
    async () => {
      const useCase = new GetFeatureFlagsUseCase(featureFlagRepo);
      return useCase.execute();
    },
  );

  // PATCH /settings/feature-flags/:id
  app.patch(
    "/feature-flags/:id",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Settings"],
        summary: "Toggle a feature flag",
        security: [{ bearerAuth: [] }],
        params: UuidParamSchema,
        body: SetFeatureFlagBodySchema,
        response: { 200: FeatureFlagSchema },
      },
    },
    async (request) => {
      const useCase = new SetFeatureFlagUseCase(featureFlagRepo);
      return useCase.execute(request.params.id, request.body.enabled);
    },
  );

  // GET /settings/maintenance
  app.get(
    "/maintenance",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Settings"],
        summary: "Get maintenance mode status",
        security: [{ bearerAuth: [] }],
        response: { 200: MaintenanceModeSchema },
      },
    },
    async () => {
      const useCase = new GetMaintenanceUseCase(settingRepo);
      return useCase.execute();
    },
  );

  // PUT /settings/maintenance
  app.put(
    "/maintenance",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ["Admin - Settings"],
        summary: "Set maintenance mode",
        security: [{ bearerAuth: [] }],
        body: MaintenanceModeSchema,
        response: { 200: MaintenanceModeSchema },
      },
    },
    async (request) => {
      const useCase = new SetMaintenanceUseCase(settingRepo);
      return useCase.execute(request.body);
    },
  );
};
