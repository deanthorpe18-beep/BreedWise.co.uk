import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Google Places Weekly Refresh — Vercel Cron Job
 * Triggered: Sundays at 03:00 UTC (configured in vercel.json)
 *
 * What this does:
 * 1. Reads breeders from Supabase that have a google_place_id.
 * 2. Fetches current public data from Google Places Details API.
 * 3. Stores permitted fields (name, address, phone, website, rating, place_id) in Supabase.
 * 4. Logs the run result for admin review.
 *
 * Compliance notes:
 * - We do NOT store Google reviews text or user-generated review content locally.
 * - We display ratings with attribution and link back to Google.
 * - Caching follows Google Maps Platform Terms of Service (refreshed weekly).
 * - If the API is unavailable, the job logs the failure and exits gracefully.
 */

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  let logEntry = null;

  try {
    // Start log
    const { data: le, error: leErr } = await supabase
      .from("google_refresh_log")
      .insert({ status: "started", records_processed: 0 })
      .select()
      .single();

    if (leErr) {
      return NextResponse.json({ error: "Failed to log refresh start." }, { status: 500 });
    }
    logEntry = le;

    // Fetch breeders with place_ids
    const { data: breeders, error: breedersErr } = await supabase
      .from("breeders")
      .select("id, slug, google_place_id")
      .not("google_place_id", "is", null)
      .in("status", ["public_listing", "claimed_profile"]);

    if (breedersErr) throw breedersErr;

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
    }

    let processed = 0;
    const errors = [];

    for (const breeder of breeders || []) {
      try {
        const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
        url.searchParams.set("place_id", breeder.google_place_id);
        url.searchParams.set("fields", "name,formatted_address,formatted_phone_number,website,rating,place_id");
        url.searchParams.set("key", apiKey);

        const res = await fetch(url.toString(), { next: { revalidate: 0 } });
        if (!res.ok) {
          errors.push(`${breeder.slug}: HTTP ${res.status}`);
          continue;
        }

        const json = await res.json();
        if (json.status !== "OK" || !json.result) {
          errors.push(`${breeder.slug}: ${json.status}`);
          continue;
        }

        const r = json.result;

        // Update permitted fields only
        const { error: updErr } = await supabase
          .from("breeders")
          .update({
            name: r.name || undefined,
            address: r.formatted_address || undefined,
            phone: r.formatted_phone_number || undefined,
            website: r.website || undefined,
            google_rating: r.rating ? Number(r.rating) : undefined,
            last_updated_at: new Date().toISOString(),
          })
          .eq("id", breeder.id);

        if (updErr) {
          errors.push(`${breeder.slug}: update error`);
          continue;
        }

        processed += 1;
      } catch (itemErr) {
        errors.push(`${breeder.slug}: ${itemErr.message}`);
      }
    }

    // Complete log
    await supabase
      .from("google_refresh_log")
      .update({
        status: errors.length > 0 && processed === 0 ? "failed" : "completed",
        records_processed: processed,
        error_message: errors.length > 0 ? errors.join("; ") : null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", logEntry.id);

    return NextResponse.json({
      message: "Google refresh job completed.",
      processed,
      errors: errors.length,
      logId: logEntry.id,
    });
  } catch (err) {
    if (logEntry?.id) {
      await supabase
        .from("google_refresh_log")
        .update({
          status: "failed",
          error_message: err.message || "Unknown error",
          completed_at: new Date().toISOString(),
        })
        .eq("id", logEntry.id);
    }

    return NextResponse.json(
      { error: "Refresh job failed.", detail: err.message },
      { status: 500 }
    );
  }
}
