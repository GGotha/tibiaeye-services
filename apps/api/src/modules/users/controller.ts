import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { UserEntity } from "../../entities/user.entity.js";
import { UpdateProfileSchema, UpdatePasswordSchema, UserProfileSchema, MessageResponseSchema } from "./schemas.js";
import { GetProfileUseCase } from "./use-cases/get-profile.use-case.js";
import { UpdateProfileUseCase } from "./use-cases/update-profile.use-case.js";
import { UpdatePasswordUseCase } from "./use-cases/update-password.use-case.js";
import { DeleteAccountUseCase } from "./use-cases/delete-account.use-case.js";

export const usersController: FastifyPluginAsyncZod = async (app) => {
  const userRepo = app.getRepository(UserEntity);

  // GET /api/v1/users/me
  app.get(
    "/me",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Users"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        response: {
          200: UserProfileSchema,
        },
      },
    },
    async (request) => {
      const useCase = new GetProfileUseCase(userRepo);
      return useCase.execute(request.user.sub);
    },
  );

  // PATCH /api/v1/users/me
  app.patch(
    "/me",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Users"],
        summary: "Update current user profile",
        security: [{ bearerAuth: [] }],
        body: UpdateProfileSchema,
        response: {
          200: UserProfileSchema,
        },
      },
    },
    async (request) => {
      const useCase = new UpdateProfileUseCase(userRepo);
      return useCase.execute(request.user.sub, request.body);
    },
  );

  // PATCH /api/v1/users/me/password
  app.patch(
    "/me/password",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Users"],
        summary: "Update current user password",
        security: [{ bearerAuth: [] }],
        body: UpdatePasswordSchema,
        response: {
          200: MessageResponseSchema,
        },
      },
    },
    async (request) => {
      const useCase = new UpdatePasswordUseCase(userRepo);
      return useCase.execute(request.user.sub, request.body);
    },
  );

  // DELETE /api/v1/users/me
  app.delete(
    "/me",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Users"],
        summary: "Delete current user account",
        security: [{ bearerAuth: [] }],
        response: {
          200: MessageResponseSchema,
        },
      },
    },
    async (request) => {
      const useCase = new DeleteAccountUseCase(userRepo);
      return useCase.execute(request.user.sub);
    },
  );
};
