const PRODUCTION_SITE_URL = "https://breedwise.co.uk";

function isLocalUrl(url) {
  if (!url) return true;
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local")
    );
  } catch {
    return true;
  }
}

/** Canonical public site URL — never localhost in production. */
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured && !isLocalUrl(configured)) {
    return configured;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }
  return configured || "http://localhost:3000";
}

export function authCallbackUrl(nextPath = "/") {
  const url = new URL("/auth/callback", getSiteUrl());
  if (nextPath && nextPath !== "/") {
    url.searchParams.set("next", nextPath);
  }
  return url.toString();
}

export function authResetCallbackUrl() {
  return `${getSiteUrl()}/auth/reset-callback`;
}
