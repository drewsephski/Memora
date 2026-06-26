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

function normalizeLocalApiUrl(url: string): string {
  // `localhost` often resolves to IPv6 (::1) while the API binds on IPv4.
  // Next.js can also listen on the same port over IPv6, so server-side fetches
  // to `localhost:PORT` may hit Next instead of the Express API.
  return url.replace("://localhost", "://127.0.0.1");
}

export function getMemoraApiUrl(fallback = "https://api.memoralabs.dev"): string {
  const url =
    process.env.MEMORA_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env[LEGACY_MEMORA_API_URL] ??
    fallback;

  return normalizeLocalApiUrl(url);
}
