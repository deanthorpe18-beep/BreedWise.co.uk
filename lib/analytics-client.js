"use client";

import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import { getSessionId, parseUtmParams } from "@/lib/analytics-session";
import { shouldSkipAnalyticsClient } from "@/lib/analytics-admin-client";

export function canTrackAnalytics() {
  return hasAnalyticsConsent() && !shouldSkipAnalyticsClient();
}

function canTrack() {
  return canTrackAnalytics();
}

function postJson(url, body, useBeacon = false) {
  const payload = JSON.stringify(body);
  if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    return;
  }
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export function trackPageView(breederSlug, pagePath) {
  if (!canTrack()) return;
  try {
    let path = pagePath || window.location.pathname;
    if (typeof window !== "undefined" && window.location.search && !path.includes("?")) {
      path += window.location.search;
    }
    const utm = parseUtmParams();
    postJson("/api/track/page-view", {
      breeder_slug: breederSlug,
      page_path: path,
      referrer: document.referrer,
      session_id: getSessionId(),
      ...utm,
    });
  } catch {
    // Silently fail
  }
}

export function trackPageDuration(pagePath, durationSeconds) {
  if (!canTrack() || !durationSeconds || durationSeconds < 1) return;
  try {
    postJson(
      "/api/track/page-duration",
      {
        session_id: getSessionId(),
        page_path: pagePath,
        duration_seconds: Math.min(Math.round(durationSeconds), 3600),
      },
      true
    );
  } catch {
    // Silently fail
  }
}

export function trackClickEvent({ pagePath, elementText, elementHref, eventType = "click" }) {
  if (!canTrack()) return;
  try {
    postJson("/api/track/click-event", {
      session_id: getSessionId(),
      page_path: pagePath || window.location.pathname + window.location.search,
      element_text: (elementText || "").slice(0, 200),
      element_href: (elementHref || "").slice(0, 500),
      event_type: eventType,
    });
  } catch {
    // Silently fail
  }
}

export function trackCtaClick(breederSlug, actionType) {
  if (!canTrack()) return;
  try {
    postJson("/api/track/cta", {
      breeder_slug: breederSlug,
      action_type: actionType,
      session_id: getSessionId(),
    });
    trackClickEvent({
      pagePath: window.location.pathname,
      elementText: actionType,
      eventType: "cta",
    });
  } catch {
    // Silently fail
  }
}

export function trackSession() {
  if (!canTrack()) return;
  try {
    const utm = parseUtmParams();
    postJson("/api/track/session", {
      session_id: getSessionId(),
      page_path: window.location.pathname + window.location.search,
      referrer: document.referrer,
      ...utm,
    });
  } catch {
    // Silently fail
  }
}
