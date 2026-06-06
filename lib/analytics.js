// Analytics tracking utility for BreedWise
// Tracks user interactions for admin insights
// All non-essential tracking is gated behind cookie consent.

function canTrack() {
  if (typeof window === "undefined") return false;
  try {
    const consent = JSON.parse(localStorage.getItem("breedwise_cookie_consent") || "{}");
    return consent.analytics === true;
  } catch {
    return false;
  }
}

export function trackPageView(page) {
  if (!canTrack()) return;
  const analytics = JSON.parse(localStorage.getItem("breedwise-analytics") || "{}");
  
  if (!analytics.pageViews) analytics.pageViews = [];
  
  analytics.pageViews.push({
    page,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString()
  });
  
  localStorage.setItem("breedwise-analytics", JSON.stringify(analytics));
}

export function trackSearch(query, breed, resultsCount) {
  if (!canTrack()) return;
  const analytics = JSON.parse(localStorage.getItem("breedwise-analytics") || "{}");
  
  if (!analytics.searches) analytics.searches = [];
  
  analytics.searches.push({
    query,
    breed,
    resultsCount,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString()
  });
  
  localStorage.setItem("breedwise-analytics", JSON.stringify(analytics));
}

export function trackFilterUsage(filters) {
  if (!canTrack()) return;
  const analytics = JSON.parse(localStorage.getItem("breedwise-analytics") || "{}");
  
  if (!analytics.filterUsage) analytics.filterUsage = [];
  
  const activeFilters = Object.entries(filters)
    .filter(([k, v]) => v !== null && v !== 0 && v !== 50)
    .map(([k]) => k);
  
  if (activeFilters.length > 0) {
    analytics.filterUsage.push({
      filters: activeFilters,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    });
  }
  
  localStorage.setItem("breedwise-analytics", JSON.stringify(analytics));
}

export function trackProfileView(breederSlug, breederName) {
  if (!canTrack()) return;
  const analytics = JSON.parse(localStorage.getItem("breedwise-analytics") || "{}");
  
  if (!analytics.profileViews) analytics.profileViews = [];
  
  analytics.profileViews.push({
    breederSlug,
    breederName,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString()
  });
  
  localStorage.setItem("breedwise-analytics", JSON.stringify(analytics));
}

export function trackSaveBreeder(breederSlug, breederName) {
  if (!canTrack()) return;
  const analytics = JSON.parse(localStorage.getItem("breedwise-analytics") || "{}");
  
  if (!analytics.savedBreeders) analytics.savedBreeders = [];
  
  analytics.savedBreeders.push({
    breederSlug,
    breederName,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString()
  });
  
  localStorage.setItem("breedwise-analytics", JSON.stringify(analytics));
}

export function trackClaimSubmission(breederSlug, breederName, email) {
  if (!canTrack()) return;
  const analytics = JSON.parse(localStorage.getItem("breedwise-analytics") || "{}");
  
  if (!analytics.claimSubmissions) analytics.claimSubmissions = [];
  
  analytics.claimSubmissions.push({
    breederSlug,
    breederName,
    email,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString()
  });
  
  localStorage.setItem("breedwise-analytics", JSON.stringify(analytics));
}

export function getAnalytics() {
  return JSON.parse(localStorage.getItem("breedwise-analytics") || "{}");
}

export function getTopSearches(limit = 5) {
  const analytics = getAnalytics();
  if (!analytics.searches) return [];
  
  const counts = {};
  analytics.searches.forEach(search => {
    const key = search.query || "unspecified";
    counts[key] = (counts[key] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
}

export function getTopBreeds(limit = 5) {
  const analytics = getAnalytics();
  if (!analytics.searches) return [];
  
  const counts = {};
  analytics.searches.forEach(search => {
    if (search.breed) {
      counts[search.breed] = (counts[search.breed] || 0) + 1;
    }
  });
  
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([breed, count]) => ({ breed, count }));
}

export function getTopProfiles(limit = 5) {
  const analytics = getAnalytics();
  if (!analytics.profileViews) return [];
  
  const counts = {};
  analytics.profileViews.forEach(view => {
    const key = view.breederName || "unknown";
    counts[key] = (counts[key] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function getMostSavedBreeders(limit = 5) {
  const analytics = getAnalytics();
  if (!analytics.savedBreeders) return [];
  
  const counts = {};
  analytics.savedBreeders.forEach(saved => {
    const key = saved.breederName || "unknown";
    counts[key] = (counts[key] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function getTopFilters(limit = 5) {
  const analytics = getAnalytics();
  if (!analytics.filterUsage) return [];
  
  const counts = {};
  analytics.filterUsage.forEach(usage => {
    usage.filters.forEach(filter => {
      counts[filter] = (counts[filter] || 0) + 1;
    });
  });
  
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([filter, count]) => ({ filter, count }));
}

export function clearAnalytics() {
  localStorage.removeItem("breedwise-analytics");
}
