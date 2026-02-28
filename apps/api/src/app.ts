import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { ZodError } from "zod";

import { env } from "./config/env.js";
import { AppError } from "./shared/errors/index.js";

// Plugins
import databasePlugin from "./plugins/database.plugin.js";
import cookiePlugin from "./plugins/cookie.plugin.js";
import authPlugin from "./plugins/auth.plugin.js";
import swaggerPlugin from "./plugins/swagger.plugin.js";
import websocketPlugin from "./plugins/websocket.plugin.js";
import queuePlugin from "./plugins/queue.plugin.js";

// Controllers
import { authController } from "./modules/auth/controller.js";
import { usersController } from "./modules/users/controller.js";
import { charactersController } from "./modules/characters/controller.js";
import { sessionsController } from "./modules/sessions/controller.js";
import { eventsController } from "./modules/events/controller.js";
import { licenseController } from "./modules/license/controller.js";
import { subscriptionsController } from "./modules/subscriptions/controller.js";
import { paymentsController } from "./modules/payments/controller.js";
import { analyticsController } from "./modules/analytics/controller.js";
import { adminController } from "./modules/admin/controller.js";
import { realtimeController } from "./modules/realtime/controller.js";
import { discordController } from "./modules/discord/controller.js";
import { tibiaDataController } from "./modules/tibia-data/controller.js";
import { routesController } from "./modules/routes/controller.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: { colorize: true },
            }
          : undefined,
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Set Zod compilers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Global error handler
  app.setErrorHandler((error: Error & { statusCode?: number; validation?: unknown }, request, reply) => {
    request.log.error(error);

    if (error instanceof ZodError) {
      return reply.status(422).send({
        statusCode: 422,
        error: "Validation Error",
        message: "Validation failed",
        issues: error.errors,
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.code || error.name,
        message: error.message,
      });
    }

    // Fastify validation errors
    if (error.validation) {
      return reply.status(422).send({
        statusCode: 422,
        error: "Validation Error",
        message: error.message,
      });
    }

    // Unknown errors
    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      statusCode,
      error: "Internal Server Error",
      message: env.NODE_ENV === "production" ? "An unexpected error occurred" : error.message,
    });
  });

  // Register plugins
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      const allowed =
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://192.168.");

      cb(null, allowed);
    },
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(swaggerPlugin);
  await app.register(databasePlugin);
  await app.register(cookiePlugin);
  await app.register(authPlugin);
  await app.register(websocketPlugin);
  await app.register(queuePlugin);

  // Health check
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  // API routes
  await app.register(
    async (api) => {
      await api.register(authController, { prefix: "/auth" });
      await api.register(usersController, { prefix: "/users" });
      await api.register(charactersController, { prefix: "/characters" });
      await api.register(sessionsController, { prefix: "/sessions" });
      await api.register(eventsController, { prefix: "/events" });
      await api.register(licenseController, { prefix: "/license" });
      await api.register(subscriptionsController, { prefix: "/subscriptions" });
      await api.register(paymentsController, { prefix: "/payments" });
      await api.register(analyticsController, { prefix: "/analytics" });
      await api.register(adminController, { prefix: "/admin" });
      await api.register(discordController, { prefix: "/discord" });
      await api.register(tibiaDataController, { prefix: "/tibia-data" });
      await api.register(routesController, { prefix: "/routes" });
    },
    { prefix: "/api/v1" },
  );

  // WebSocket controller (outside of /api/v1)
  await app.register(realtimeController, { prefix: "/ws" });

  return app;
}
