/**
 * Central gate for all Google Places / Maps API usage.
 * Disabled by default — set GOOGLE_PLACES_API_ENABLED=true only when billing is resolved.
 * Never use NEXT_PUBLIC_* for Google keys (exposes them in the browser bundle).
 */

export function isGooglePlacesApiEnabled() {
  if (process.env.GOOGLE_PLACES_API_DISABLED === "true" || process.env.GOOGLE_PLACES_API_DISABLED === "1") {
    return false;
  }
  if (process.env.GOOGLE_PLACES_API_ENABLED !== "true" && process.env.GOOGLE_PLACES_API_ENABLED !== "1") {
    return false;
  }
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key || key === "dummy" || key.startsWith("dummy-") || key === "your_google_places_api_key_here") {
    return false;
  }
  return true;
}

export function getGooglePlacesApiKey() {
  if (!isGooglePlacesApiEnabled()) return null;
  return process.env.GOOGLE_PLACES_API_KEY.trim();
}

export const GOOGLE_API_DISABLED_MESSAGE =
  "Google Places API is disabled. Set GOOGLE_PLACES_API_ENABLED=true with a valid server key when ready.";
