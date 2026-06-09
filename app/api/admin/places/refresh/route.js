import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

const FIELD_MASK = "id,displayName,rating,reviews,userRatingCount,formattedAddress,websiteUri,nationalPhoneNumber,photos";

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { placeId, all } = body;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    if (!placeId && !all) {
      return NextResponse.json(
        { error: "Request body must include placeId or all: true" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const adminId = auth.user.id;
    const results = [];

    if (all) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: staleRecords, error: fetchError } = await supabase
        .from("google_places_cache")
        .select("place_id")
        .lt("cached_at", sevenDaysAgo);

      if (fetchError) throw fetchError;

      for (const record of staleRecords || []) {
        const result = await refreshPlace(record.place_id, apiKey, supabase, now, adminId);
        results.push(result);
      }

      return NextResponse.json({
        success: true,
        refreshed: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      });
    }

    const result = await refreshPlace(placeId, apiKey, supabase, now, adminId);
    return NextResponse.json({
      success: result.success,
      result,
    });
  } catch (error) {
    console.error("Admin refresh error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function refreshPlace(placeId, apiKey, supabase, now, adminId) {
  try {
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

    const { data: existing } = await supabase
      .from("google_places_cache")
      .select("refresh_count")
      .eq("place_id", placeId)
      .single();

    const cacheRecord = {
      place_id: placeId,
      place_data: data,
      reviews_data: data.reviews || null,
      photos_data: data.photos || null,
      cached_at: now,
      refreshed_at: now,
      last_accessed_at: now,
      admin_refreshed_at: now,
      admin_refreshed_by: adminId,
      refresh_count: existing ? (existing.refresh_count || 0) + 1 : 1,
    };

    if (existing) {
      const { error } = await supabase
        .from("google_places_cache")
        .update(cacheRecord)
        .eq("place_id", placeId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("google_places_cache")
        .insert(cacheRecord);
      if (error) throw error;
    }

    return { placeId, success: true, cached_at: now };
  } catch (error) {
    return { placeId, success: false, error: error.message };
  }
}
