import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import scalarReference from "@scalar/fastify-api-reference";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

async function swaggerPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "TibiaEye API",
        description: "API REST para o sistema de telemetria TibiaEye",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:4000",
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT token for user authentication",
          },
          apiKeyAuth: {
            type: "http",
            scheme: "bearer",
            description: "API Key for bot authentication (tm_xxx...)",
          },
        },
      },
      tags: [
        { name: "Auth", description: "Authentication endpoints" },
        { name: "Users", description: "User management" },
        { name: "Characters", description: "Character management" },
        { name: "Sessions", description: "Hunt session management" },
        { name: "Events", description: "Event tracking (kills, loot, XP)" },
        { name: "License", description: "License key management" },
        { name: "Subscriptions", description: "Subscription management" },
        { name: "Payments", description: "Payment webhooks" },
        { name: "Analytics", description: "Analytics and reports" },
        { name: "Admin", description: "Admin operations" },
        { name: "Realtime", description: "WebSocket real-time updates" },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await fastify.register(scalarReference, {
    routePrefix: "/api/docs",
  });
}

export default fp(swaggerPlugin, {
  name: "swagger",
});
