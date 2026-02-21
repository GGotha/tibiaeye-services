import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import fastifyWebsocket from "@fastify/websocket";

async function websocketPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyWebsocket, {
    options: {
      maxPayload: 1048576, // 1MB
    },
  });
}

export default fp(websocketPlugin, {
  name: "websocket",
});
