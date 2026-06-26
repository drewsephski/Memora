import { handleStripeWebhookEvent } from "@/lib/billing";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_SIGNATURE_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook signature configuration" },
      { status: 400 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Webhook error: ${(error as Error).message}` },
      { status: 400 },
    );
  }

  await handleStripeWebhookEvent(event);

  return NextResponse.json({ received: true });
}
