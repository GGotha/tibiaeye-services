import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { UserEntity } from "../../entities/user.entity.js";
import { PlanEntity } from "../../entities/plan.entity.js";
import { SubscriptionEntity } from "../../entities/subscription.entity.js";
import { LicenseKeyEntity } from "../../entities/license-key.entity.js";
import { COOKIE_NAME, COOKIE_OPTIONS } from "../../plugins/cookie.plugin.js";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  AuthResponseSchema,
  MessageResponseSchema,
} from "./schemas.js";
import { RegisterUseCase } from "./use-cases/register.use-case.js";
import { LoginUseCase } from "./use-cases/login.use-case.js";
import { ForgotPasswordUseCase } from "./use-cases/forgot-password.use-case.js";
import { ResetPasswordUseCase } from "./use-cases/reset-password.use-case.js";
import { RefreshTokenUseCase } from "./use-cases/refresh-token.use-case.js";

export const authController: FastifyPluginAsyncZod = async (app) => {
  const userRepo = app.getRepository(UserEntity);
  const planRepo = app.getRepository(PlanEntity);
  const subscriptionRepo = app.getRepository(SubscriptionEntity);
  const licenseKeyRepo = app.getRepository(LicenseKeyEntity);

  // POST /api/v1/auth/register
  app.post(
    "/register",
    {
      schema: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Creates a new user account and sets authentication cookie",
        body: RegisterSchema,
        response: {
          201: AuthResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const useCase = new RegisterUseCase(userRepo, app.jwt, planRepo, subscriptionRepo, licenseKeyRepo);
      const { token, user, licenseKey } = await useCase.execute(request.body);

      // Set HttpOnly cookie
      reply.setCookie(COOKIE_NAME, token, COOKIE_OPTIONS);

      return reply.status(201).send({ user, licenseKey });
    },
  );

  // POST /api/v1/auth/login
  app.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Login with email and password",
        description: "Authenticates user and sets authentication cookie",
        body: LoginSchema,
        response: {
          200: AuthResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const useCase = new LoginUseCase(userRepo, app.jwt);
      const { token, user } = await useCase.execute(request.body);

      // Set HttpOnly cookie
      reply.setCookie(COOKIE_NAME, token, COOKIE_OPTIONS);

      return { user };
    },
  );

  // POST /api/v1/auth/logout
  app.post(
    "/logout",
    {
      schema: {
        tags: ["Auth"],
        summary: "Logout current user",
        description: "Clears the authentication cookie",
        response: {
          200: MessageResponseSchema,
        },
      },
    },
    async (request, reply) => {
      // Clear the cookie
      reply.clearCookie(COOKIE_NAME, { path: "/" });

      return { message: "Logged out successfully" };
    },
  );

  // POST /api/v1/auth/refresh
  app.post(
    "/refresh",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Auth"],
        summary: "Refresh authentication token",
        description: "Issues a new authentication cookie using the current valid cookie",
        security: [{ bearerAuth: [] }],
        response: {
          200: AuthResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const useCase = new RefreshTokenUseCase(userRepo, app.jwt);
      const { token, user } = await useCase.execute(request.user);

      // Set new HttpOnly cookie
      reply.setCookie(COOKIE_NAME, token, COOKIE_OPTIONS);

      return { user };
    },
  );

  // POST /api/v1/auth/forgot-password
  app.post(
    "/forgot-password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Request password reset email",
        body: ForgotPasswordSchema,
        response: {
          200: MessageResponseSchema,
        },
      },
    },
    async (request) => {
      const useCase = new ForgotPasswordUseCase(userRepo);
      return useCase.execute(request.body);
    },
  );

  // POST /api/v1/auth/reset-password
  app.post(
    "/reset-password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Reset password with token",
        body: ResetPasswordSchema,
        response: {
          200: MessageResponseSchema,
        },
      },
    },
    async (request) => {
      const useCase = new ResetPasswordUseCase(userRepo);
      return useCase.execute(request.body);
    },
  );
};
