import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/server";
import { isGooglePlacesApiEnabled, getGooglePlacesApiKey, GOOGLE_API_DISABLED_MESSAGE } from "@/lib/google-api-config";

const CACHE_TTL_DAYS = 7;
const FIELD_MASK = "id,displayName,rating,reviews,userRatingCount,formattedAddress,websiteUri,nationalPhoneNumber,photos";

export async function GET(request, { params }) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limit = rateLimitByIp(ip, 30, 60000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { placeId } = await params;

  if (!isGooglePlacesApiEnabled()) {
    return NextResponse.json({ error: GOOGLE_API_DISABLED_MESSAGE, disabled: true }, { status: 503 });
  }

  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: GOOGLE_API_DISABLED_MESSAGE, disabled: true }, { status: 503 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const staleCutoff = new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Check cache first
    const { data: cached, error: cacheError } = await supabase
      .from("google_places_cache")
      .select("*")
      .eq("place_id", placeId)
      .single();

    if (cacheError && cacheError.code !== "PGRST116") {
      // PGRST116 = no rows returned, anything else is a real error
      throw cacheError;
    }

    const isStale = !cached || cached.cached_at < staleCutoff;

    if (cached && !isStale) {
      // Cache hit and fresh — update last_accessed_at
      await supabase
        .from("google_places_cache")
        .update({ last_accessed_at: now })
        .eq("place_id", placeId);

      return NextResponse.json({
        ...cached.place_data,
        _cached: true,
        cached_at: cached.cached_at,
      });
    }

    // Cache miss or stale — fetch from Google Places API
    const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Places API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    const cacheRecord = {
      place_id: placeId,
      place_data: data,
      reviews_data: data.reviews || null,
      photos_data: data.photos || null,
      cached_at: now,
      refreshed_at: now,
      last_accessed_at: now,
      refresh_count: cached ? (cached.refresh_count || 0) + 1 : 1,
    };

    if (cached) {
      const { error: upsertError } = await supabase
        .from("google_places_cache")
        .update(cacheRecord)
        .eq("place_id", placeId);
      if (upsertError) throw upsertError;
    } else {
      const { error: insertError } = await supabase
        .from("google_places_cache")
        .insert(cacheRecord);
      if (insertError) throw insertError;
    }

    return NextResponse.json({
      ...data,
      _cached: false,
      cached_at: now,
    });
  } catch (error) {
    console.error("Places API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
