import { z } from "zod";

export const PlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priceMonthly: z.number(),
  priceYearly: z.number(),
  maxCharacters: z.number(),
  historyDays: z.number(),
  apiRequestsPerDay: z.number(),
  features: z.array(z.string()),
  isActive: z.boolean(),
});

export const PlansListSchema = z.array(PlanSchema);

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  plan: PlanSchema,
  status: z.enum(["active", "cancelled", "past_due", "trialing"]),
  externalId: z.string().nullable(),
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime(),
  cancelAtPeriodEnd: z.boolean(),
  daysRemaining: z.number(),
  createdAt: z.string().datetime(),
});

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export type Plan = z.infer<typeof PlanSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
