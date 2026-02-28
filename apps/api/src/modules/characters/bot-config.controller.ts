import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { CharacterEntity } from "../../entities/character.entity.js";
import { BotConfigEntity } from "../../entities/bot-config.entity.js";
import { SessionEntity, SessionStatus } from "../../entities/session.entity.js";
import type { ApiKeyPayload } from "../../plugins/auth.plugin.js";
import { NotFoundError, ForbiddenError } from "../../shared/errors/index.js";
import { BotConfigSchema, BotConfigPartialSchema, BotConfigResponseSchema } from "./bot-config.schemas.js";
import { broadcastToRoom } from "../../shared/realtime/room-manager.js";

export const botConfigController: FastifyPluginAsyncZod = async (app) => {
  const characterRepo = app.getRepository(CharacterEntity);
  const botConfigRepo = app.getRepository(BotConfigEntity);
  const sessionRepo = app.getRepository(SessionEntity);

  // Helper: get userId from JWT or API Key
  function getUserId(request: FastifyRequest): string {
    if (request.user?.sub) return request.user.sub;
    const apiKey = (request as FastifyRequest & { apiKey?: ApiKeyPayload }).apiKey;
    if (apiKey?.userId) return apiKey.userId;
    throw new ForbiddenError("Authentication required");
  }

  // Helper: validate character ownership
  async function getOwnedCharacter(characterId: string, userId: string) {
    const character = await characterRepo.findOne({ where: { id: characterId } });
    if (!character) throw new NotFoundError("Character not found");
    if (character.userId !== userId) throw new ForbiddenError("Not your character");
    return character;
  }

  // GET /config - dual auth (JWT or API Key)
  app.get(
    "/",
    {
      onRequest: [async (request, reply) => {
        // Try JWT first, then API Key
        try {
          await app.authenticate(request, reply);
        } catch {
          await app.authenticateApiKey(request, reply);
        }
      }],
      schema: {
        tags: ["Bot Config"],
        summary: "Get bot config for a character",
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        response: { 200: BotConfigResponseSchema },
      },
    },
    async (request) => {
      const userId = getUserId(request);
      await getOwnedCharacter(request.params.id, userId);

      const botConfig = await botConfigRepo.findOne({
        where: { characterId: request.params.id },
      });

      return {
        characterId: request.params.id,
        config: botConfig?.config ?? {},
        version: botConfig?.version ?? 0,
        updatedAt: botConfig?.updatedAt?.toISOString() ?? null,
      };
    },
  );

  // PUT /config - full upsert (JWT only)
  app.put(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Bot Config"],
        summary: "Upsert full bot config",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        body: BotConfigSchema,
        response: { 200: BotConfigResponseSchema },
      },
    },
    async (request) => {
      const userId = request.user.sub;
      await getOwnedCharacter(request.params.id, userId);

      let botConfig = await botConfigRepo.findOne({
        where: { characterId: request.params.id },
      });

      if (botConfig) {
        botConfig.config = request.body as Record<string, unknown>;
        botConfig.version += 1;
      } else {
        botConfig = botConfigRepo.create({
          characterId: request.params.id,
          config: request.body as Record<string, unknown>,
          version: 1,
        });
      }

      const saved = await botConfigRepo.save(botConfig);

      // Broadcast to bot via WS if session is active
      await broadcastConfigUpdate(request.params.id, saved);

      return {
        characterId: request.params.id,
        config: saved.config,
        version: saved.version,
        updatedAt: saved.updatedAt.toISOString(),
      };
    },
  );

  // PATCH /config - deep merge partial (JWT only)
  app.patch(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Bot Config"],
        summary: "Partially update bot config (deep merge)",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string().uuid() }),
        body: BotConfigPartialSchema,
        response: { 200: BotConfigResponseSchema },
      },
    },
    async (request) => {
      const userId = request.user.sub;
      await getOwnedCharacter(request.params.id, userId);

      let botConfig = await botConfigRepo.findOne({
        where: { characterId: request.params.id },
      });

      const partial = request.body as Record<string, unknown>;

      if (botConfig) {
        botConfig.config = deepMerge(botConfig.config, partial);
        botConfig.version += 1;
      } else {
        botConfig = botConfigRepo.create({
          characterId: request.params.id,
          config: partial,
          version: 1,
        });
      }

      const saved = await botConfigRepo.save(botConfig);

      // Broadcast to bot via WS if session is active
      await broadcastConfigUpdate(request.params.id, saved);

      return {
        characterId: request.params.id,
        config: saved.config,
        version: saved.version,
        updatedAt: saved.updatedAt.toISOString(),
      };
    },
  );

  // Helper: broadcast config update to active session
  async function broadcastConfigUpdate(characterId: string, botConfig: BotConfigEntity) {
    const session = await sessionRepo.findOne({
      where: { characterId, status: SessionStatus.ACTIVE },
    });
    if (!session) return;

    broadcastToRoom(session.id, {
      type: "config-updated",
      config: botConfig.config,
      version: botConfig.version,
    });
  }
};

// Deep merge utility
function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = result[key];
    const overVal = override[key];
    if (
      baseVal && overVal &&
      typeof baseVal === "object" && !Array.isArray(baseVal) &&
      typeof overVal === "object" && !Array.isArray(overVal)
    ) {
      result[key] = deepMerge(baseVal as Record<string, unknown>, overVal as Record<string, unknown>);
    } else {
      result[key] = overVal;
    }
  }
  return result;
}
