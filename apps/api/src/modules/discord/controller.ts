import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { DiscordIntegrationEntity } from "../../entities/discord-integration.entity.js";
import {
  CreateDiscordIntegrationSchema,
  UpdateDiscordIntegrationSchema,
  DiscordIntegrationOutputSchema,
  DiscordIntegrationListSchema,
} from "./schemas.js";
import { CreateDiscordIntegrationUseCase } from "./use-cases/create-discord-integration.use-case.js";
import { UpdateDiscordIntegrationUseCase } from "./use-cases/update-discord-integration.use-case.js";
import { DeleteDiscordIntegrationUseCase } from "./use-cases/delete-discord-integration.use-case.js";
import { ListDiscordIntegrationsUseCase } from "./use-cases/list-discord-integrations.use-case.js";
import { TestDiscordIntegrationUseCase } from "./use-cases/test-discord-integration.use-case.js";

export const discordController: FastifyPluginAsyncZod = async (app) => {
  const integrationRepo = app.getRepository(DiscordIntegrationEntity);

  app.post(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Discord"],
        summary: "Create a Discord integration",
        security: [{ bearerAuth: [] }],
        body: CreateDiscordIntegrationSchema,
        response: {
          201: DiscordIntegrationOutputSchema,
        },
      },
    },
    async (request, reply) => {
      const useCase = new CreateDiscordIntegrationUseCase(integrationRepo);
      const result = await useCase.execute(request.user.sub, request.body);
      return reply.status(201).send(result);
    },
  );

  app.get(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Discord"],
        summary: "List Discord integrations",
        security: [{ bearerAuth: [] }],
        response: {
          200: DiscordIntegrationListSchema,
        },
      },
    },
    async (request) => {
      const useCase = new ListDiscordIntegrationsUseCase(integrationRepo);
      return useCase.execute(request.user.sub);
    },
  );

  app.patch(
    "/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Discord"],
        summary: "Update a Discord integration",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        body: UpdateDiscordIntegrationSchema,
        response: {
          200: DiscordIntegrationOutputSchema,
        },
      },
    },
    async (request) => {
      const useCase = new UpdateDiscordIntegrationUseCase(integrationRepo);
      return useCase.execute(request.user.sub, request.params.id, request.body);
    },
  );

  app.delete(
    "/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Discord"],
        summary: "Delete a Discord integration",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: {
          204: z.undefined(),
        },
      },
    },
    async (request, reply) => {
      const useCase = new DeleteDiscordIntegrationUseCase(integrationRepo);
      await useCase.execute(request.user.sub, request.params.id);
      return reply.status(204).send();
    },
  );

  app.post(
    "/:id/test",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Discord"],
        summary: "Test a Discord integration",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request) => {
      const useCase = new TestDiscordIntegrationUseCase(integrationRepo);
      return useCase.execute(request.user.sub, request.params.id);
    },
  );
};
