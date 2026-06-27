"use client";

import type { Tables } from "@/types/supabase";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { getNextUsageResetDate } from "@/lib/utils";
import { STRIPE_PRODUCT_IDS } from "@/lib/config";
import {
  getApiCallLimitForTier,
  getSubscriptionTierLabel,
  resolveSubscriptionTier,
  SUBSCRIPTION_TIERS,
} from "@memora/common/billing";
import { getStartDateForApiUsage } from "@memora/common/usage";

type UsageCardProps = {
  initialStorageUsage?: number;
  isSubscribed?: boolean;
  subscribedProductId: Tables<"profiles">["stripe_subscribed_product_id"];
  lastUsageResetAt?: string | null;
};

export function UsageCard({
  initialStorageUsage = 0,
  isSubscribed = false,
  subscribedProductId = null,
  lastUsageResetAt = null,
}: UsageCardProps) {
  const supabase = createClient();

  const [apiCallUsage, setApiCallUsage] = useState(0);
  const [apiCallLimit, setApiCallLimit] = useState(
    getApiCallLimitForTier(SUBSCRIPTION_TIERS.FREE),
  );
  const nextUsageResetDate = getNextUsageResetDate(lastUsageResetAt);

  const subscriptionTier = resolveSubscriptionTier({
    isSubscribed,
    productId: subscribedProductId,
    stripeProductIds: {
      basic: STRIPE_PRODUCT_IDS.BASIC,
      enterprise: STRIPE_PRODUCT_IDS.ENTERPRISE,
    },
  });
  const subscriptionTierLabel = getSubscriptionTierLabel(subscriptionTier);

  const [isLoading, setIsLoading] = useState(true);

  const apiCallPercentage = Math.min(100, (apiCallUsage / apiCallLimit) * 100);

  useEffect(() => {
    async function fetchUsageData() {
      try {
        setIsLoading(true);

        // Set limits based on subscription tier
        setApiCallLimit(getApiCallLimitForTier(subscriptionTier));

        // Get usage start date based on last_usage_reset_at
        const usageStartDate = getStartDateForApiUsage(lastUsageResetAt);

        // Fetch API usage since the last usage reset date
        const { count } = await supabase
          .from("api_usage_logs")
          .select("id", { count: "exact", head: true })
          .gte("created_at", usageStartDate.toISOString());

        setApiCallUsage(count || 0);
      } catch (error) {
        console.error("Error fetching usage data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsageData();
  }, [supabase, initialStorageUsage, subscriptionTier, lastUsageResetAt]);

  return (
    <Card className="basis-full md:basis-1/2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Usage (this period)</CardTitle>
          {subscriptionTier && (
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
              {subscriptionTierLabel} Plan
            </span>
          )}
        </div>
        <CardDescription>Your current usage and limits</CardDescription>
        {nextUsageResetDate && (
          <CardDescription className="mt-1">
            Usage will reset{" "}
            {new Date(nextUsageResetDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              API Calls
            </div>
            <div className="font-medium">
              {isLoading ? "Loading..." : `${apiCallUsage} / ${apiCallLimit}`}
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${isLoading ? 0 : apiCallPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
