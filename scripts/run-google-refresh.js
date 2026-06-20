/**
 * @deprecated Use scripts/sync-breeder-photos.js — cache-first, skips fresh data.
 * Kept as a thin wrapper for backwards compatibility.
 */
require("./_env");

const { getSupabaseAdmin, getGooglePlacesApiKey } = require("./_env");

async function main() {
  const { syncBreederFromGoogle, backfillHeroFromStorage, isPhotoSyncStale } = await import(
    "../lib/google-places-sync.js"
  );

  const supabase = getSupabaseAdmin();
  const apiKey = getGooglePlacesApiKey();

  const { data: breeders, error } = await supabase
    .from("breeders")
    .select(
      "id, slug, google_place_id, hero_image_url, google_photo_urls, google_photos_last_updated, last_updated_at, breeder_photos(photo_reference, photo_url, is_primary)"
    )
    .not("google_place_id", "is", null)
    .in("status", ["public_listing", "claimed_profile"]);

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  let stats = { backfilled: 0, synced: 0, skipped: 0, placeCalls: 0, photoCalls: 0 };

  for (const breeder of breeders || []) {
    const bf = await backfillHeroFromStorage(supabase, breeder);
    if (bf.updated) {
      stats.backfilled++;
      breeder.hero_image_url = bf.hero;
    }

    if (!isPhotoSyncStale(breeder)) {
      stats.skipped++;
      continue;
    }

    const result = await syncBreederFromGoogle(supabase, apiKey, breeder);
    stats.placeCalls += result.placeApiCalls;
    stats.photoCalls += result.photoApiCalls;
    if (result.skipped) stats.skipped++;
    else stats.synced++;

    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\n=== Done (cache-first) ===");
  console.log(JSON.stringify(stats, null, 2));
}

main().catch((err) => console.error("Fatal:", err));
