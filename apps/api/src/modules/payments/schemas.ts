import { z } from "zod";

export const WebhookPayloadSchema = z.object({
  event: z.enum([
    "subscription.created",
    "subscription.updated",
    "subscription.cancelled",
    "subscription.expired",
    "payment.success",
    "payment.failed",
  ]),
  data: z.object({
    id: z.string(),
    plan_id: z.string().optional(),
    amount: z.number().optional(),
    status: z.string().optional(),
    metadata: z
      .object({
        user_id: z.string().uuid(),
      })
      .optional(),
  }),
});

export const WebhookResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  licenseKey: z.string().optional(), // Only included on subscription.created
});

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
export type WebhookResponse = z.infer<typeof WebhookResponseSchema>;
