/**
 * Server-side analytics for BreedWise
 * Logs lightweight events to Supabase analytics_events table.
 * No PII is stored in metadata beyond what is necessary for funnel analysis.
 */

import { createClient } from "@/lib/supabase/server";

export async function trackServerEvent({ eventType, pagePath, metadata = {} }) {
  try {
    const supabase = createClient();
    await supabase.from("analytics_events").insert({
      event_type: eventType,
      page_path: pagePath || null,
      metadata: metadata || {},
    });
  } catch {
    // Silent fail: analytics must never break user flows
  }
}

export async function trackSearchEvent({ query, breed, resultsCount, pagePath }) {
  return trackServerEvent({
    eventType: "search",
    pagePath,
    metadata: { query: query || null, breed: breed || null, resultsCount: resultsCount ?? null },
  });
}

export async function trackClaimCtaClick({ pagePath, breederSlug }) {
  return trackServerEvent({
    eventType: "claim_cta_click",
    pagePath,
    metadata: { breeder_slug: breederSlug || null },
  });
}

export async function trackRemovalInitiation({ pagePath, breederSlug }) {
  return trackServerEvent({
    eventType: "removal_initiation",
    pagePath,
    metadata: { breeder_slug: breederSlug || null },
  });
}

export async function trackProfileContactClick({ pagePath, breederSlug, action }) {
  return trackServerEvent({
    eventType: "profile_contact_click",
    pagePath,
    metadata: { breeder_slug: breederSlug || null, action: action || null },
  });
}

export async function trackPopularBreedClick({ breed, pagePath }) {
  return trackServerEvent({
    eventType: "popular_breed_click",
    pagePath,
    metadata: { breed: breed || null },
  });
}

export async function trackPopularLocationClick({ location, pagePath }) {
  return trackServerEvent({
    eventType: "popular_location_click",
    pagePath,
    metadata: { location: location || null },
  });
}

export async function trackEducationEngagement({ guideSlug, pagePath }) {
  return trackServerEvent({
    eventType: "education_engagement",
    pagePath,
    metadata: { guide_slug: guideSlug || null },
  });
}

export async function trackNoResultSearch({ query, breed, pagePath }) {
  return trackServerEvent({
    eventType: "no_result_search",
    pagePath,
    metadata: { query: query || null, breed: breed || null },
  });
}

export async function trackAuthEvent({ eventType, emailHash, pagePath }) {
  return trackServerEvent({
    eventType,
    pagePath,
    metadata: { email_hash: emailHash || null },
  });
}
