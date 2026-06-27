// Stripe product IDs
export const STRIPE_PRODUCT_IDS = {
  BASIC:
    process.env.STRIPE_PRODUCT_BASIC ??
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_BASIC,
  ENTERPRISE:
    process.env.STRIPE_PRODUCT_ENTERPRISE ??
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ENTERPRISE,
};

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required environment variables are missing
 */
export function validateEnvironmentVariables(): void {
  const missingVariables: string[] = [];

  if (!STRIPE_PRODUCT_IDS.BASIC) {
    missingVariables.push("STRIPE_PRODUCT_BASIC");
  }

  if (!STRIPE_PRODUCT_IDS.ENTERPRISE) {
    missingVariables.push("STRIPE_PRODUCT_ENTERPRISE");
  }

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}. ` +
        "Set server-side STRIPE_PRODUCT_* values or the matching NEXT_PUBLIC_STRIPE_PRODUCT_* fallback values.",
    );
  }
}

validateEnvironmentVariables();
