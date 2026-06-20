/**
 * Backfill missing breeder photos with minimal Google API usage.
 *
 * 1. Repair hero_image_url from Supabase-only data (0 API calls)
 * 2. Only call Google for breeders still missing photos or stale (>90 days)
 * 3. Skip photo downloads when photo_reference already in breeder_photos
 *
 * Usage:
 *   node scripts/sync-breeder-photos.js
 *   node scripts/sync-breeder-photos.js --limit=100
 *   node scripts/sync-breeder-photos.js --only-missing
 *   node scripts/sync-breeder-photos.js --dry-run
 */

require("./_env");

const { getSupabaseAdmin, getGooglePlacesApiKey } = require("./_env");

async function main() {
  const { backfillHeroFromStorage, syncBreederFromGoogle, isPhotoSyncStale } = await import(
    "../lib/google-places-sync.js"
  );

  const args = process.argv.slice(2);
  const limit = parseInt(args.find((a) => a.startsWith("--limit="))?.split("=")[1] || "200", 10);
  const onlyMissing = args.includes("--only-missing");
  const dryRun = args.includes("--dry-run");

  const supabase = getSupabaseAdmin();
  const apiKey = getGooglePlacesApiKey();

  console.log("=== BreedWise photo sync (cache-first) ===\n");

  let query = supabase
    .from("breeders")
    .select(
      "id, slug, google_place_id, hero_image_url, google_photo_urls, google_photos_last_updated, last_updated_at, breeder_photos(photo_reference, photo_url, is_primary)"
    )
    .not("google_place_id", "is", null)
    .in("status", ["public_listing", "claimed_profile"]);

  if (onlyMissing) {
    query = query.is("hero_image_url", null);
  }

  const { data: breeders, error } = await query.limit(limit);
  if (error) {
    console.error("Fetch error:", error.message);
    process.exit(1);
  }

  console.log(`Candidates: ${breeders.length} (limit ${limit}, only-missing=${onlyMissing})\n`);

  let backfilled = 0;
  let skipped = 0;
  let synced = 0;
  let placeCalls = 0;
  let photoCalls = 0;

  for (const breeder of breeders) {
    const beforeHero = breeder.hero_image_url;

    const backfill = await backfillHeroFromStorage(supabase, breeder);
    if (backfill.updated) {
      backfilled++;
      breeder.hero_image_url = backfill.hero;
      if (backfill.hero && !breeder.google_photos_last_updated) {
        breeder.google_photos_last_updated = new Date().toISOString();
      }
      console.log(`✓ Backfilled hero (no API): ${breeder.slug}`);
    }

    if (!isPhotoSyncStale(breeder) && backfill.hero) {
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] Would sync: ${breeder.slug} (hero=${beforeHero ? "yes" : "no"})`);
      continue;
    }

    const stats = await syncBreederFromGoogle(supabase, apiKey, breeder);
    placeCalls += stats.placeApiCalls;
    photoCalls += stats.photoApiCalls;

    if (stats.skipped) {
      skipped++;
    } else {
      synced++;
      console.log(
        `✓ Synced ${breeder.slug} — place API: ${stats.placeApiCalls}, photo API: ${stats.photoApiCalls}`
      );
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\n=== Summary ===");
  console.log(`Hero backfilled (0 API): ${backfilled}`);
  console.log(`Skipped (already fresh): ${skipped}`);
  console.log(`Synced from Google:      ${synced}`);
  console.log(`Place Details API calls: ${placeCalls}`);
  console.log(`Place Photo API calls:   ${photoCalls}`);
  console.log(`Total Google API calls:  ${placeCalls + photoCalls}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
