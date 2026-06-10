// Client-side analytics tracking utility for BreedWise
// NOTE: All page view tracking now goes through lib/analytics-client.js (server API)
// This file is kept for localStorage-based event tracking gated by cookie consent.

function canTrack() {
  if (typeof window === "undefined") return false;
  try {
    const consent = JSON.parse(localStorage.getItem("breedwise_cookie_consent") || "{}");
    return consent.analytics === true;
  } catch {
    return false;
  }
}

export function trackSearch(query, breed, resultsCount) {
  if (!canTrack()) return;
  const analytics = JSON.parse(localStorage.getItem("breedwise-analytics") || "{}");
  if (!analytics.searches) analytics.searches = [];
  analytics.searches.push({ query, breed, resultsCount, timestamp: new Date().toISOString() });
  localStorage.setItem("breedwise-analytics", JSON.stringify(analytics));
}

export function trackFilterUsage(filters) {
  if (!canTrack()) return;
  const analytics = JSON.parse(localStorage.getItem("breedwise-analytics") || "{}");
  if (!analytics.filterUsage) analytics.filterUsage = [];
  const activeFilters = Object.entries(filters).filter(([, v]) => v !== null && v !== 0 && v !== 50).map(([k]) => k);
  if (activeFilters.length > 0) {
    analytics.filterUsage.push({ filters: activeFilters, timestamp: new Date().toISOString() });
  }
  localStorage.setItem("breedwise-analytics", JSON.stringify(analytics));
}

export function trackSaveBreeder(breederSlug, breederName) {
  if (!canTrack()) return;
  const analytics = JSON.parse(localStorage.getItem("breedwise-analytics") || "{}");
  if (!analytics.savedBreeders) analytics.savedBreeders = [];
  analytics.savedBreeders.push({ breederSlug, breederName, timestamp: new Date().toISOString() });
  localStorage.setItem("breedwise-analytics", JSON.stringify(analytics));
}

export function getAnalytics() {
  return JSON.parse(localStorage.getItem("breedwise-analytics") || "{}");
}
