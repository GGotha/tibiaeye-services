import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fastifyJwt from "@fastify/jwt";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import { LicenseKeyEntity } from "../entities/license-key.entity.js";
import { UnauthorizedError, ForbiddenError } from "../shared/errors/index.js";
import { COOKIE_NAME } from "./cookie.plugin.js";

export interface JwtPayload {
  sub: string;
  email: string;
  role: "user" | "admin";
}

export interface ApiKeyPayload {
  userId: string;
  subscriptionId: string;
  licenseKeyId: string;
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateApiKey: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

async function authPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
    cookie: {
      cookieName: COOKIE_NAME,
      signed: false,
    },
  });

  // JWT authentication decorator - reads from cookie first, then Authorization header
  fastify.decorate("authenticate", async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      // Try cookie first
      const cookieToken = request.cookies[COOKIE_NAME];
      if (cookieToken) {
        await request.jwtVerify({ onlyCookie: true });
        return;
      }

      // Fall back to Authorization header (for backwards compatibility)
      await request.jwtVerify();
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  });

  // API Key authentication decorator (for bot) - only uses Authorization header
  fastify.decorate("authenticateApiKey", async (request: FastifyRequest, _reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing API key");
    }

    const apiKey = authHeader.slice(7);

    if (!apiKey.startsWith("tm_")) {
      throw new UnauthorizedError("Invalid API key format");
    }

    const keyPrefix = apiKey.slice(0, 11); // tm_ + 8 chars

    const licenseKeyRepo = fastify.getRepository(LicenseKeyEntity);
    const licenseKey = await licenseKeyRepo.findOne({
      where: { keyPrefix, status: "active" },
      relations: ["subscription"],
    });

    if (!licenseKey) {
      throw new UnauthorizedError("Invalid API key");
    }

    // Verify hash
    const isValid = await bcrypt.compare(apiKey, licenseKey.keyHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid API key");
    }

    // Check subscription is active
    if (!licenseKey.subscription || licenseKey.subscription.status !== "active") {
      throw new UnauthorizedError("Subscription is not active");
    }

    // Check subscription hasn't expired
    if (new Date() > licenseKey.subscription.currentPeriodEnd) {
      throw new UnauthorizedError("Subscription has expired");
    }

    // Update last used
    await licenseKeyRepo.update(licenseKey.id, {
      lastUsedAt: new Date(),
      totalRequests: () => "totalRequests + 1",
    });

    // Attach payload to request
    (request as FastifyRequest & { apiKey: ApiKeyPayload }).apiKey = {
      userId: licenseKey.userId,
      subscriptionId: licenseKey.subscriptionId,
      licenseKeyId: licenseKey.id,
    };
  });

  // Admin role decorator
  fastify.decorate("requireAdmin", async (request: FastifyRequest, _reply: FastifyReply) => {
    await fastify.authenticate(request, _reply);

    if (request.user.role !== "admin") {
      throw new ForbiddenError("Admin access required");
    }
  });
}

export default fp(authPlugin, {
  name: "auth",
  dependencies: ["database", "cookie"],
});
