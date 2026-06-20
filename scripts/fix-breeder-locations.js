/**
 * Fix town/county/region/country from google_places_cache or Place Details API.
 *
 * Usage:
 *   node scripts/fix-breeder-locations.js --cats
 *   node scripts/fix-breeder-locations.js --all
 *   node scripts/fix-breeder-locations.js --cats --dry-run
 */

require("./_env");
const { getSupabaseAdmin, getGooglePlacesApiKey } = require("./_env");
const { locationFromPlace } = require("./address-utils");

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const catsOnly = args.includes("--cats");
  const all = args.includes("--all");

  const supabase = getSupabaseAdmin();
  const apiKey = getGooglePlacesApiKey();
  const { getPlaceDetails } = await import("../lib/google-places-sync.js");

  let query = supabase
    .from("breeders")
    .select("id, slug, name, google_place_id, town, county, region, country, source_tags")
    .in("status", ["public_listing", "claimed_profile"])
    .not("google_place_id", "is", null);

  if (catsOnly && !all) {
    query = query.contains("source_tags", ["cat_breeder"]);
  }

  const { data: breeders, error } = await query;
  if (error) throw error;

  console.log(`Fixing locations for ${breeders?.length || 0} breeders${dryRun ? " (dry-run)" : ""}\n`);

  let updated = 0;
  let apiCalls = 0;

  for (const b of breeders || []) {
    let place = null;

    const { data: cached } = await supabase
      .from("google_places_cache")
      .select("place_data")
      .eq("place_id", b.google_place_id)
      .maybeSingle();

    if (cached?.place_data?.addressComponents?.length) {
      place = cached.place_data;
    } else {
      const result = await getPlaceDetails(supabase, apiKey, b.google_place_id, { forceRefresh: !cached?.place_data?.addressComponents?.length });
      apiCalls += result.fromCache ? 0 : 1;
      place = result.data;
      await new Promise((r) => setTimeout(r, 150));
    }

    if (!place) continue;

    const loc = locationFromPlace(place, b.town);

    const needsUpdate =
      loc.county !== b.county ||
      loc.region !== b.region ||
      loc.town !== b.town ||
      loc.country !== b.country;

    if (!needsUpdate) continue;

    if (dryRun) {
      console.log(`[dry-run] ${b.slug}: county ${b.county} → ${loc.county}, region ${b.region} → ${loc.region}`);
      updated++;
      continue;
    }

    const { error: upErr } = await supabase
      .from("breeders")
      .update({
        town: loc.town,
        county: loc.county,
        region: loc.region,
        country: loc.country,
        postcode: loc.postcode || undefined,
        last_updated_at: new Date().toISOString(),
      })
      .eq("id", b.id);

    if (upErr) {
      console.log(`✗ ${b.slug}: ${upErr.message}`);
    } else {
      updated++;
      console.log(`✓ ${b.slug} → ${loc.town}, ${loc.county}, ${loc.region}`);
    }
  }

  console.log(`\nUpdated: ${updated}, Place Details API: ${apiCalls}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
