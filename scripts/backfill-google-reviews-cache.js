/**
 * Backfill google_places_cache with review text for existing breeders.
 * Profile pages read from cache only — run this offline to avoid per-visit API cost.
 *
 * Usage:
 *   node scripts/backfill-google-reviews-cache.js
 *   node scripts/backfill-google-reviews-cache.js --limit=20
 *   node scripts/backfill-google-reviews-cache.js --dry-run
 */

require("./_env");

const { getSupabaseAdmin, getGooglePlacesApiKey } = require("./_env");

async function main() {
  const { getCachedPlace, getPlaceDetails, reviewsFromCacheRow } = await import(
    "../lib/google-places-sync.js"
  );

  const args = process.argv.slice(2);
  const limit = parseInt(args.find((a) => a.startsWith("--limit="))?.split("=")[1] || "50", 10);
  const dryRun = args.includes("--dry-run");

  const supabase = getSupabaseAdmin();
  const apiKey = getGooglePlacesApiKey();

  console.log("=== Backfill Google Reviews Cache ===\n");

  let allBreeders = [];
  let from = 0;
  const batchSize = 500;

  while (true) {
    const { data: batch, error } = await supabase
      .from("breeders")
      .select("id, slug, name, google_place_id")
      .neq("status", "archived")
      .not("google_place_id", "is", null)
      .range(from, from + batchSize - 1);

    if (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
    if (!batch?.length) break;
    allBreeders = allBreeders.concat(batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }

  const needsReviews = [];
  for (const b of allBreeders) {
    const cached = await getCachedPlace(supabase, b.google_place_id);
    if (reviewsFromCacheRow(cached).length === 0) {
      needsReviews.push(b);
    }
  }

  console.log(`Breeders with Google Place ID: ${allBreeders.length}`);
  console.log(`Missing cached reviews:          ${needsReviews.length}`);
  console.log(`Processing up to:                ${limit}${dryRun ? " (dry-run)" : ""}\n`);

  if (needsReviews.length === 0) {
    console.log("All breeders already have cached reviews.");
    return;
  }

  let fetched = 0;
  let skipped = 0;
  let failed = 0;
  let apiCalls = 0;

  for (const b of needsReviews.slice(0, limit)) {
    console.log(`[${fetched + skipped + failed + 1}/${Math.min(limit, needsReviews.length)}] ${b.name}`);

    if (dryRun) {
      console.log("  [dry-run] Would fetch Place Details (reviews)");
      fetched++;
      continue;
    }

    const { data, fromCache } = await getPlaceDetails(supabase, apiKey, b.google_place_id, {
      forceRefresh: true,
    });

    if (!fromCache) apiCalls += 1;

    if (!data) {
      console.log("  ✗ API returned no data");
      failed++;
      continue;
    }

    const count = (data.reviews || []).length;
    if (count === 0) {
      console.log("  — No review text from Google (rating-only listing)");
      skipped++;
    } else {
      console.log(`  ✓ Cached ${count} review(s)`);
      fetched++;
    }

    await new Promise((r) => setTimeout(r, 150));
  }

  console.log("\n=== Summary ===");
  console.log(`Cached with reviews: ${fetched}`);
  console.log(`No review text:      ${skipped}`);
  console.log(`Failed:              ${failed}`);
  console.log(`Place Details API:   ${apiCalls}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
