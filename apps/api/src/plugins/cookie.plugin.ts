import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import fastifyCookie from "@fastify/cookie";
import { env } from "../config/env.js";

export const COOKIE_NAME = "tibiaeye_token";
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

async function cookiePlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyCookie, {
    secret: env.JWT_SECRET, // Used for signing cookies (optional)
    hook: "onRequest",
  });
}

export default fp(cookiePlugin, {
  name: "cookie",
});
