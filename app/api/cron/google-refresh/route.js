import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  syncBreederFromGoogle,
  isPhotoSyncStale,
  isMetadataStale,
  backfillHeroFromStorage,
} from "@/lib/google-places-sync";

/** Max breeders per cron run — avoids timeouts and API spend spikes. */
const BATCH_LIMIT = 50;

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  let logEntry = null;

  try {
    const { data: le, error: leErr } = await supabase
      .from("google_refresh_log")
      .insert({ status: "started", records_processed: 0 })
      .select()
      .single();

    if (leErr) {
      return NextResponse.json({ error: "Failed to log refresh start." }, { status: 500 });
    }
    logEntry = le;

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
    }

    const { data: breeders, error: breedersErr } = await supabase
      .from("breeders")
      .select(
        "id, slug, google_place_id, hero_image_url, google_photo_urls, google_photos_last_updated, last_updated_at, breeder_photos(photo_reference, photo_url, is_primary)"
      )
      .not("google_place_id", "is", null)
      .in("status", ["public_listing", "claimed_profile"])
      .limit(500);

    if (breedersErr) throw breedersErr;

    let processed = 0;
    let skipped = 0;
    let backfilled = 0;
    let placeApiCalls = 0;
    let photoApiCalls = 0;
    const errors = [];

    const stale = (breeders || []).filter(
      (b) => isPhotoSyncStale(b) || isMetadataStale(b) || !b.hero_image_url
    );

    for (const breeder of stale.slice(0, BATCH_LIMIT)) {
      try {
        const bf = await backfillHeroFromStorage(supabase, breeder);
        if (bf.updated) {
          backfilled++;
          breeder.hero_image_url = bf.hero;
        }

        if (!isPhotoSyncStale(breeder) && !isMetadataStale(breeder)) {
          skipped++;
          continue;
        }

        const stats = await syncBreederFromGoogle(supabase, apiKey, breeder);
        placeApiCalls += stats.placeApiCalls;
        photoApiCalls += stats.photoApiCalls;

        if (stats.skipped) {
          skipped++;
        } else {
          processed++;
        }
      } catch (itemErr) {
        errors.push(`${breeder.slug}: ${itemErr.message}`);
      }
    }

    await supabase
      .from("google_refresh_log")
      .update({
        status: errors.length > 0 && processed === 0 ? "failed" : "completed",
        records_processed: processed,
        error_message:
          errors.length > 0
            ? `${errors.slice(0, 5).join("; ")}${errors.length > 5 ? "…" : ""}`
            : null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", logEntry.id);

    return NextResponse.json({
      message: "Google refresh completed (cache-first, stale-only).",
      staleCandidates: stale.length,
      processed,
      skipped,
      backfilled,
      placeApiCalls,
      photoApiCalls,
      totalApiCalls: placeApiCalls + photoApiCalls,
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
