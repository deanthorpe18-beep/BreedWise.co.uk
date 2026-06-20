"use client";

import { hasAnalyticsConsent } from "@/lib/cookie-consent";

function canTrack() {
  return hasAnalyticsConsent();
}

export function trackPageView(breederSlug, pagePath) {
  if (!canTrack()) return;
  try {
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
  if (!canTrack()) return;
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
  if (!canTrack()) return;
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
