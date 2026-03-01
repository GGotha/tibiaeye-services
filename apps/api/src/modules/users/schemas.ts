import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
});

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar: z.string().nullable(),
  role: z.enum(["user", "admin"]),
  status: z.enum(["active", "suspended", "banned"]),
  createdAt: z.string().datetime(),
});

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
