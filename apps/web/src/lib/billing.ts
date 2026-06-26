import "server-only";

import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/utils/supabase/admin";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
]);

type ProfileUpdate = {
  stripe_customer_id?: string | null;
  stripe_interval?: string | null;
  stripe_is_subscribed?: boolean;
  stripe_subscribed_product_id?: string | null;
  last_usage_reset_at?: string | null;
};

type StripeCustomerInput = {
  userId: string;
  email?: string | null;
  name?: string | null;
  existingCustomerId?: string | null;
};

type SyncSubscriptionOptions = {
  userId?: string | null;
};

function getStripeObjectId(
  value: string | { id: string } | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function getSubscriptionPrice(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price ?? null;
}

function getSubscriptionProductId(subscription: Stripe.Subscription) {
  const price = getSubscriptionPrice(subscription);

  return getStripeObjectId(price?.product);
}

function getSubscriptionInterval(subscription: Stripe.Subscription) {
  return getSubscriptionPrice(subscription)?.recurring?.interval ?? null;
}

function buildProfileUpdateFromSubscription(
  subscription: Stripe.Subscription,
): ProfileUpdate {
  const isSubscribed = ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status);

  if (!isSubscribed) {
    return {
      stripe_is_subscribed: false,
      stripe_interval: null,
      stripe_subscribed_product_id: null,
      last_usage_reset_at: null,
    };
  }

  return {
    stripe_is_subscribed: true,
    stripe_interval: getSubscriptionInterval(subscription),
    stripe_subscribed_product_id: getSubscriptionProductId(subscription),
  };
}

async function getProfileUsageResetAt(match: {
  id?: string;
  stripe_customer_id?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("last_usage_reset_at")
    .match(match)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch billing profile: ${error.message}`);
  }

  return data?.last_usage_reset_at ?? null;
}

export async function getOrCreateStripeCustomer({
  userId,
  email,
  name,
  existingCustomerId,
}: StripeCustomerInput) {
  if (existingCustomerId) {
    try {
      const existingCustomer = await stripe.customers.retrieve(
        existingCustomerId,
      );

      if (!("deleted" in existingCustomer && existingCustomer.deleted)) {
        return existingCustomer.id;
      }
    } catch (error) {
      if ((error as { code?: string }).code !== "resource_missing") {
        throw error;
      }
    }
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: name ?? undefined,
    metadata: {
      supabase_user_id: userId,
    },
  });

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .match({ id: userId });

  if (error) {
    throw new Error(`Failed to save Stripe customer ID: ${error.message}`);
  }

  return customer.id;
}

export async function syncStripeSubscription(
  subscription: Stripe.Subscription,
  options: SyncSubscriptionOptions = {},
) {
  const customerId = getStripeObjectId(subscription.customer);

  if (!customerId) {
    throw new Error(`Subscription ${subscription.id} is missing a customer`);
  }

  const match = options.userId
    ? { id: options.userId }
    : { stripe_customer_id: customerId };

  const updateData = buildProfileUpdateFromSubscription(subscription);

  if (updateData.stripe_is_subscribed) {
    const lastUsageResetAt = await getProfileUsageResetAt(match);

    if (!lastUsageResetAt) {
      updateData.last_usage_reset_at = new Date().toISOString();
    }
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      ...updateData,
      stripe_customer_id: customerId,
    })
    .match(match);

  if (error) {
    throw new Error(`Failed to sync Stripe subscription: ${error.message}`);
  }
}

export async function syncCheckoutSessionSubscription(
  sessionId: string,
  userId: string,
) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  const sessionUserId = session.client_reference_id ??
    session.metadata?.supabase_user_id;

  if (sessionUserId !== userId) {
    throw new Error("Checkout session does not belong to the signed-in user");
  }

  if (session.mode !== "subscription") {
    throw new Error("Checkout session is not a subscription session");
  }

  const subscription =
    typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;

  if (!subscription) {
    throw new Error("Checkout session is missing a subscription");
  }

  await syncStripeSubscription(subscription, { userId });
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      if (session.mode !== "subscription" || !session.subscription) {
        return;
      }

      const subscription =
        typeof session.subscription === "string"
          ? await stripe.subscriptions.retrieve(session.subscription)
          : session.subscription;

      await syncStripeSubscription(subscription, {
        userId: session.client_reference_id ?? session.metadata?.supabase_user_id,
      });
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncStripeSubscription(event.data.object);
      return;
    default:
      return;
  }
}
