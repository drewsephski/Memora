/** @deprecated Use MEMORA_API_KEY. Removed after Supavec → Memora migration. */
const LEGACY_MEMORA_API_KEY = "SUPAVEC_API_KEY";

/** @deprecated Use MEMORA_API_URL. Removed after Supavec → Memora migration. */
const LEGACY_MEMORA_API_URL = "SUPAVEC_API_URL";

export function getMemoraApiKey(): string {
  return (
    process.env.MEMORA_API_KEY ??
    process.env[LEGACY_MEMORA_API_KEY] ??
    ""
  );
}

export function getMemoraApiUrl(fallback = "https://api.memoralabs.dev"): string {
  return (
    process.env.MEMORA_API_URL ??
    process.env[LEGACY_MEMORA_API_URL] ??
    fallback
  );
}
