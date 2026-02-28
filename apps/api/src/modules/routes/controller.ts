import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { RouteEntity } from "../../entities/route.entity.js";
import {
  CreateRouteSchema,
  UpdateRouteSchema,
  ImportRouteSchema,
  RouteSchema,
  RouteListSchema,
  RouteExportSchema,
  MessageResponseSchema,
} from "./schemas.js";
import { CreateRouteUseCase } from "./use-cases/create-route.use-case.js";
import { ListRoutesUseCase } from "./use-cases/list-routes.use-case.js";
import { GetRouteUseCase } from "./use-cases/get-route.use-case.js";
import { UpdateRouteUseCase } from "./use-cases/update-route.use-case.js";
import { DeleteRouteUseCase } from "./use-cases/delete-route.use-case.js";

export const routesController: FastifyPluginAsyncZod = async (app) => {
  const routeRepo = app.getRepository(RouteEntity);

  // GET /api/v1/routes
  app.get(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Routes"],
        summary: "List all routes for the current user",
        security: [{ bearerAuth: [] }],
        response: { 200: RouteListSchema },
      },
    },
    async (request) => {
      const useCase = new ListRoutesUseCase(routeRepo);
      return useCase.execute(request.user.sub);
    },
  );

  // POST /api/v1/routes
  app.post(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Routes"],
        summary: "Create a new route",
        security: [{ bearerAuth: [] }],
        body: CreateRouteSchema,
        response: { 201: RouteSchema },
      },
    },
    async (request, reply) => {
      const useCase = new CreateRouteUseCase(routeRepo);
      const result = await useCase.execute(request.user.sub, request.body);
      return reply.status(201).send(result);
    },
  );

  // GET /api/v1/routes/:id
  app.get(
    "/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Routes"],
        summary: "Get a route by ID",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: { 200: RouteSchema },
      },
    },
    async (request) => {
      const useCase = new GetRouteUseCase(routeRepo);
      return useCase.execute(request.user.sub, request.params.id);
    },
  );

  // PUT /api/v1/routes/:id
  app.put(
    "/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Routes"],
        summary: "Update a route",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        body: UpdateRouteSchema,
        response: { 200: RouteSchema },
      },
    },
    async (request) => {
      const useCase = new UpdateRouteUseCase(routeRepo);
      return useCase.execute(request.user.sub, request.params.id, request.body);
    },
  );

  // DELETE /api/v1/routes/:id
  app.delete(
    "/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Routes"],
        summary: "Delete a route",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: { 200: MessageResponseSchema },
      },
    },
    async (request) => {
      const useCase = new DeleteRouteUseCase(routeRepo);
      return useCase.execute(request.user.sub, request.params.id);
    },
  );

  // GET /api/v1/routes/:id/export
  app.get(
    "/:id/export",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Routes"],
        summary: "Export route as bot-compatible JSON",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: { 200: RouteExportSchema },
      },
    },
    async (request) => {
      const useCase = new GetRouteUseCase(routeRepo);
      const route = await useCase.execute(request.user.sub, request.params.id);
      return {
        name: route.name,
        waypoints: route.waypoints,
        metadata: route.metadata,
      };
    },
  );

  // POST /api/v1/routes/import
  app.post(
    "/import",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Routes"],
        summary: "Import a route from bot JSON format",
        security: [{ bearerAuth: [] }],
        body: ImportRouteSchema,
        response: { 201: RouteSchema },
      },
    },
    async (request, reply) => {
      const useCase = new CreateRouteUseCase(routeRepo);
      const result = await useCase.execute(request.user.sub, {
        name: request.body.name,
        waypoints: request.body.waypoints,
      });

      // Save metadata separately
      if (request.body.metadata) {
        const route = await routeRepo.findOne({ where: { id: result.id } });
        if (route) {
          route.metadata = request.body.metadata;
          await routeRepo.save(route);
          result.metadata = request.body.metadata;
        }
      }

      return reply.status(201).send(result);
    },
  );
};
