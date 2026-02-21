import { abacatepay } from "@/lib/abacatepay";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-abacatepay-signature") ?? "";

    const isValid = await abacatepay.verifyWebhook(payload, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);

    switch (event.type) {
      case "subscription.created":
        await activateSubscription(event.data);
        break;
      case "subscription.cancelled":
        await cancelSubscription(event.data);
        break;
      case "payment.failed":
        await notifyPaymentFailed(event.data);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

interface SubscriptionData {
  customer: {
    metadata: {
      userId: string;
    };
  };
  planId: string;
  subscriptionId: string;
}

async function activateSubscription(data: SubscriptionData) {
  await fetch(`${process.env.API_URL}/api/v1/subscriptions/activate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_INTERNAL_TOKEN}`,
    },
    body: JSON.stringify({
      userId: data.customer.metadata.userId,
      planId: data.planId,
      externalId: data.subscriptionId,
    }),
  });
}

async function cancelSubscription(data: SubscriptionData) {
  await fetch(`${process.env.API_URL}/api/v1/subscriptions/cancel-by-external`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_INTERNAL_TOKEN}`,
    },
    body: JSON.stringify({
      externalId: data.subscriptionId,
    }),
  });
}

async function notifyPaymentFailed(_data: SubscriptionData) {
  // TODO: Implement email notification for failed payments
}
