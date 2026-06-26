import "server-only";

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: Stripe.API_VERSION,
});

export type StripePriceId = (typeof STRIPE_PRICE_IDS)[number];

export const STRIPE_PRICE_IDS = [
  process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY,
  process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_YEARLY,
  process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY,
  process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY,
].filter((priceId): priceId is string => Boolean(priceId));

export function isAllowedStripePriceId(priceId: string): priceId is StripePriceId {
  return STRIPE_PRICE_IDS.includes(priceId);
}
