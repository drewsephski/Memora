export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  BASIC: "basic",
  ENTERPRISE: "enterprise",
  UNKNOWN_PAID: "unknown_paid",
} as const;

export type SubscriptionTier =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

export type StripeProductIds = {
  basic?: string | null;
  enterprise?: string | null;
};

export type SubscriptionTierInput = {
  isSubscribed?: boolean | null;
  productId?: string | null;
  stripeProductIds: StripeProductIds;
};

export const API_CALL_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: 100,
  [SUBSCRIPTION_TIERS.BASIC]: 750,
  [SUBSCRIPTION_TIERS.ENTERPRISE]: 5000,
  [SUBSCRIPTION_TIERS.UNKNOWN_PAID]: 750,
} as const satisfies Record<SubscriptionTier, number>;

export const STORAGE_LIMITS_MB = {
  [SUBSCRIPTION_TIERS.FREE]: 250,
  [SUBSCRIPTION_TIERS.BASIC]: 2 * 1024,
  [SUBSCRIPTION_TIERS.ENTERPRISE]: 15 * 1024,
  [SUBSCRIPTION_TIERS.UNKNOWN_PAID]: 2 * 1024,
} as const satisfies Record<SubscriptionTier, number>;

export const SUBSCRIPTION_TIER_LABELS = {
  [SUBSCRIPTION_TIERS.FREE]: "Free",
  [SUBSCRIPTION_TIERS.BASIC]: "Basic",
  [SUBSCRIPTION_TIERS.ENTERPRISE]: "Enterprise",
  [SUBSCRIPTION_TIERS.UNKNOWN_PAID]: "Paid",
} as const satisfies Record<SubscriptionTier, string>;

export function resolveSubscriptionTier({
  isSubscribed,
  productId,
  stripeProductIds,
}: SubscriptionTierInput): SubscriptionTier {
  if (!isSubscribed) {
    return SUBSCRIPTION_TIERS.FREE;
  }

  if (productId && productId === stripeProductIds.enterprise) {
    return SUBSCRIPTION_TIERS.ENTERPRISE;
  }

  if (productId && productId === stripeProductIds.basic) {
    return SUBSCRIPTION_TIERS.BASIC;
  }

  return SUBSCRIPTION_TIERS.UNKNOWN_PAID;
}

export function isUnknownPaidTier(tier: SubscriptionTier): boolean {
  return tier === SUBSCRIPTION_TIERS.UNKNOWN_PAID;
}

export function getSubscriptionTierLabel(tier: SubscriptionTier): string {
  return SUBSCRIPTION_TIER_LABELS[tier];
}

export function getApiCallLimitForTier(tier: SubscriptionTier): number {
  return API_CALL_LIMITS[tier];
}

export function getStorageLimitMbForTier(tier: SubscriptionTier): number {
  return STORAGE_LIMITS_MB[tier];
}
