/** Client-safe helpers — exclude admin usage from product analytics. */

const SKIP_KEY = "breedwise_skip_analytics";

export function isAdminRole(role) {
  return role === "admin" || role === "super_admin";
}

export function setAnalyticsSkip(skip) {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (skip) sessionStorage.setItem(SKIP_KEY, "1");
    else sessionStorage.removeItem(SKIP_KEY);
    window.dispatchEvent(new Event("breedwise-analytics-skip-changed"));
  } catch {
    // ignore
  }
}

export function shouldSkipAnalyticsClient() {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

export function syncAnalyticsSkipFromUser(user) {
  setAnalyticsSkip(!!user && isAdminRole(user.role));
}
