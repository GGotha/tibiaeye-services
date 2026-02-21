import { abacatepay } from "@/lib/abacatepay";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, billingCycle, email } = body;

    if (plan === "starter") {
      return NextResponse.json({
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup`,
      });
    }

    const checkout = await abacatepay.createCheckout({
      plan,
      billingCycle,
      customerEmail: email,
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
