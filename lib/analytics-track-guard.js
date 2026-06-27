import { isAdmin } from "@/lib/auth";

/** Skip visitor/search analytics when an admin is logged in (server-side). */
export async function trackingExcludedForUser() {
  const { authorized } = await isAdmin();
  return authorized;
}
