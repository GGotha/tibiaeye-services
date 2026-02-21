const ABACATEPAY_API_URL = "https://api.abacatepay.com/v1";

interface CreateCheckoutParams {
  plan: "starter" | "pro" | "enterprise";
  billingCycle: "monthly" | "yearly";
  customerId?: string;
  customerEmail?: string;
}

interface CheckoutResponse {
  id: string;
  url: string;
  expiresAt: string;
}

export class AbacatePay {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse> {
    const priceId = this.getPriceId(params.plan, params.billingCycle);

    const response = await fetch(`${ABACATEPAY_API_URL}/billing/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
        customer: params.customerId ? { id: params.customerId } : { email: params.customerEmail },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout");
    }

    return response.json();
  }

  private getPriceId(plan: string, cycle: string): string {
    const prices: Record<string, Record<string, string>> = {
      pro: {
        monthly: process.env.ABACATEPAY_PRO_MONTHLY_PRICE_ID!,
        yearly: process.env.ABACATEPAY_PRO_YEARLY_PRICE_ID!,
      },
      enterprise: {
        monthly: process.env.ABACATEPAY_ENTERPRISE_MONTHLY_PRICE_ID!,
        yearly: process.env.ABACATEPAY_ENTERPRISE_YEARLY_PRICE_ID!,
      },
    };

    return prices[plan]?.[cycle] ?? "";
  }

  async verifyWebhook(payload: string, signature: string): Promise<boolean> {
    const crypto = await import("node:crypto");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.ABACATEPAY_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }
}

export const abacatepay = new AbacatePay(process.env.ABACATEPAY_API_KEY!);
