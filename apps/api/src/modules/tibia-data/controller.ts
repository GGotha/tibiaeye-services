import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  BoostedCreaturesResponseSchema,
  CharacterNameParamSchema,
  KillStatisticsResponseSchema,
  RashidLocationResponseSchema,
  SpriteQuerySchema,
  TibiaCharacterResponseSchema,
  TibiaWorldResponseSchema,
  TibiaWorldsResponseSchema,
  WorldNameParamSchema,
} from "./schemas.js";
import { GetBoostedCreaturesUseCase } from "./use-cases/get-boosted-creatures.use-case.js";
import { GetCharacterInfoUseCase } from "./use-cases/get-character-info.use-case.js";
import { GetKillStatisticsUseCase } from "./use-cases/get-kill-statistics.use-case.js";
import { GetRashidLocationUseCase } from "./use-cases/get-rashid-location.use-case.js";
import { GetWorldInfoUseCase } from "./use-cases/get-world-info.use-case.js";
import { GetWorldsOverviewUseCase } from "./use-cases/get-worlds-overview.use-case.js";
import { ResolveSpriteUrlUseCase } from "./use-cases/resolve-sprite-url.use-case.js";

function buildSpriteFileName(name: string, type: string): string {
  const normalized = name.replace(/ /g, "_");
  if (type === "outfit") {
    return `${normalized}.gif`;
  }
  return `${normalized}.gif`;
}

export const tibiaDataController: FastifyPluginAsyncZod = async (app) => {
  // GET /api/v1/tibia-data/character/:name (requires auth)
  app.get(
    "/character/:name",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["TibiaData"],
        summary: "Get character info from TibiaData API",
        security: [{ bearerAuth: [] }],
        params: CharacterNameParamSchema,
        response: { 200: TibiaCharacterResponseSchema },
      },
    },
    async (request) => {
      const { name } = request.params;
      const useCase = new GetCharacterInfoUseCase();
      return useCase.execute(name);
    },
  );

  // GET /api/v1/tibia-data/world/:name (public)
  app.get(
    "/world/:name",
    {
      schema: {
        tags: ["TibiaData"],
        summary: "Get world info from TibiaData API",
        params: WorldNameParamSchema,
        response: { 200: TibiaWorldResponseSchema },
      },
    },
    async (request) => {
      const { name } = request.params;
      const useCase = new GetWorldInfoUseCase();
      return useCase.execute(name);
    },
  );

  // GET /api/v1/tibia-data/worlds (public)
  app.get(
    "/worlds",
    {
      schema: {
        tags: ["TibiaData"],
        summary: "Get all worlds overview",
        response: { 200: TibiaWorldsResponseSchema },
      },
    },
    async () => {
      const useCase = new GetWorldsOverviewUseCase();
      return useCase.execute();
    },
  );

  // GET /api/v1/tibia-data/boosted (public)
  app.get(
    "/boosted",
    {
      schema: {
        tags: ["TibiaData"],
        summary: "Get boosted boss and creature of the day",
        response: { 200: BoostedCreaturesResponseSchema },
      },
    },
    async () => {
      const useCase = new GetBoostedCreaturesUseCase();
      return useCase.execute();
    },
  );

  // GET /api/v1/tibia-data/rashid (public)
  app.get(
    "/rashid",
    {
      schema: {
        tags: ["TibiaData"],
        summary: "Get Rashid current location",
        response: { 200: RashidLocationResponseSchema },
      },
    },
    async () => {
      const useCase = new GetRashidLocationUseCase();
      return useCase.execute();
    },
  );

  // GET /api/v1/tibia-data/killstatistics/:world (public)
  app.get(
    "/killstatistics/:name",
    {
      schema: {
        tags: ["TibiaData"],
        summary: "Get kill statistics for a world",
        params: WorldNameParamSchema,
        response: { 200: KillStatisticsResponseSchema },
      },
    },
    async (request) => {
      const { name } = request.params;
      const useCase = new GetKillStatisticsUseCase();
      return useCase.execute(name);
    },
  );

  // GET /api/v1/tibia-data/sprite?name=Dragon&type=creature (public, proxies image)
  app.get(
    "/sprite",
    {
      schema: {
        tags: ["TibiaData"],
        summary: "Proxy a Tibia sprite image from Fandom CDN",
        querystring: SpriteQuerySchema,
      },
    },
    async (request, reply) => {
      const { name, type } = request.query;
      const fileName = buildSpriteFileName(name, type);
      const useCase = new ResolveSpriteUrlUseCase();
      const cdnUrl = await useCase.execute(fileName);

      if (!cdnUrl) {
        return reply.status(404).send({ message: "Sprite not found" });
      }

      const imageResponse = await fetch(cdnUrl);
      if (!imageResponse.ok) {
        return reply.status(502).send({ message: "Failed to fetch sprite" });
      }

      const contentType = imageResponse.headers.get("content-type") || "image/gif";
      const buffer = Buffer.from(await imageResponse.arrayBuffer());

      return reply
        .header("content-type", contentType)
        .header("cache-control", "public, max-age=86400, immutable")
        .header("cross-origin-resource-policy", "cross-origin")
        .send(buffer);
    },
  );
};
