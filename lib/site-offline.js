/** Whole-site maintenance / offline switch. */

export function isSiteOffline() {
  const v = process.env.SITE_OFFLINE || process.env.MAINTENANCE_MODE;
  return v === "true" || v === "1";
}

export const SITE_OFFLINE_MESSAGE =
  process.env.SITE_OFFLINE_MESSAGE?.trim() ||
  "BreedWise is temporarily offline for maintenance. Please check back soon.";
