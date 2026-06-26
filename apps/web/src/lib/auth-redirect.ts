const FALLBACK_APP_ORIGIN = "http://localhost:3000";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

type HeaderReader = Pick<Headers, "get">;

function toOrigin(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string) {
  try {
    return LOCAL_HOSTNAMES.has(new URL(origin).hostname);
  } catch {
    return false;
  }
}

function normalizeLoopbackOrigin(origin: string) {
  const url = new URL(origin);

  if (url.hostname === "127.0.0.1" || url.hostname === "[::1]") {
    url.hostname = "localhost";
  }

  return url.origin;
}

export function getRequestOrigin(headersList: HeaderReader) {
  const origin = toOrigin(headersList.get("origin"));
  if (origin) return origin;

  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  if (!host) return null;

  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  return toOrigin(`${protocol}://${host}`);
}

export function getAppOrigin(requestOrigin?: string | null) {
  const configuredOrigin = toOrigin(process.env.NEXT_PUBLIC_APP_URL);

  if (configuredOrigin && !isLocalOrigin(configuredOrigin)) {
    return configuredOrigin;
  }

  if (requestOrigin) {
    return normalizeLoopbackOrigin(requestOrigin);
  }

  if (configuredOrigin) {
    return normalizeLoopbackOrigin(configuredOrigin);
  }

  return FALLBACK_APP_ORIGIN;
}

export function getAuthCallbackUrl(requestOrigin?: string | null) {
  return new URL("/auth/callback", getAppOrigin(requestOrigin)).toString();
}

export function getPostAuthRedirectUrl(
  path: "/dashboard" | "/login",
  requestOrigin?: string | null,
) {
  return new URL(path, getAppOrigin(requestOrigin)).toString();
}
