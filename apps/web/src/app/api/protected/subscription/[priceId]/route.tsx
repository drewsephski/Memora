import { getOrCreateStripeCustomer } from "@/lib/billing";
import { isAllowedStripePriceId, stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<unknown> },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user == null)
      return NextResponse.json(
        { status: "error", result: "Bad Request" },
        { status: 400 }
      );

    const { data, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id, name")
      .match({ id: user.id })
      .single();

    if (error) {
      console.error(error.message);
      return NextResponse.json(
        { result: "error", message: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    const routeParams = await params;
    const priceId =
      typeof routeParams === "object" &&
      routeParams !== null &&
      "priceId" in routeParams
        ? String(routeParams.priceId)
        : "";

    if (!isAllowedStripePriceId(priceId)) {
      return NextResponse.json(
        { result: "error", message: "Unknown subscription price" },
        { status: 400 },
      );
    }

    const stripeCustomerId = await getOrCreateStripeCustomer({
      userId: user.id,
      email: user.email,
      name: data.name,
      existingCustomerId: data.stripe_customer_id,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    console.log(`Creating Stripe checkout session for user ${user.id}`);
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      client_reference_id: user.id,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url:
        `${appUrl}/dashboard/settings/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      allow_promotion_codes: true,
      metadata: {
        supabase_user_id: user.id,
        stripe_price_id: priceId,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          stripe_price_id: priceId,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { result: "error", message: "Stripe did not return a checkout URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      result: "success",
      id: session.id,
      url: session.url,
    });
  } catch (err) {
    return NextResponse.json(
      { result: "error", message: (err as Error)?.message ?? "" },
      { status: 500 }
    );
  }
}
