import { z } from "zod";

export const CreateCharacterSchema = z.object({
  name: z.string().min(1).max(50),
});

export const CharacterSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  world: z.string(),
  level: z.number().nullable(),
  vocation: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CharacterListSchema = z.array(CharacterSchema);

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export type CreateCharacterInput = z.infer<typeof CreateCharacterSchema>;
export type Character = z.infer<typeof CharacterSchema>;
