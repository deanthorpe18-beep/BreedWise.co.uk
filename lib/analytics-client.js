"use client";

// Lightweight client-side analytics tracking
// These fire-and-forget to not block user interaction

export function trackPageView(breederSlug, pagePath) {
  try {
    // Capture full path including query params (for UTM tracking)
    let path = pagePath || window.location.pathname;
    if (typeof window !== "undefined" && window.location.search && !path.includes("?")) {
      path += window.location.search;
    }
    fetch("/api/track/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        breeder_slug: breederSlug,
        page_path: path,
        referrer: document.referrer,
      }),
    }).catch(() => {});
  } catch {
    // Silently fail
  }
}

export function trackCtaClick(breederSlug, actionType) {
  try {
    fetch("/api/track/cta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        breeder_slug: breederSlug,
        action_type: actionType,
      }),
    }).catch(() => {});
  } catch {
    // Silently fail
  }
}

export function trackSession() {
  try {
    fetch("/api/track/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => {});
  } catch {
    // Silently fail
  }
}
