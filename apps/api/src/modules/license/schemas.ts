import { z } from "zod";

export const ValidateLicenseSchema = z.object({
  apiKey: z.string().min(1),
});

export const ValidateLicenseResponseSchema = z.object({
  valid: z.boolean(),
  userId: z.string().uuid().optional(),
  daysRemaining: z.number().optional(),
  message: z.string().optional(),
});

export const UserLicenseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "revoked"]),
  keyPrefix: z.string(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().nullable(),
  totalRequests: z.number(),
  subscription: z.object({
    id: z.string().uuid(),
    status: z.enum(["active", "cancelled", "past_due", "trialing"]),
    currentPeriodEnd: z.string().datetime(),
    daysRemaining: z.number(),
  }),
});

export const RegenerateLicenseResponseSchema = z.object({
  licenseKey: z.string(),
});

export type ValidateLicenseInput = z.infer<typeof ValidateLicenseSchema>;
export type ValidateLicenseResponse = z.infer<typeof ValidateLicenseResponseSchema>;
export type UserLicense = z.infer<typeof UserLicenseSchema>;
export type RegenerateLicenseResponse = z.infer<typeof RegenerateLicenseResponseSchema>;
