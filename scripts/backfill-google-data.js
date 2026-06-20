/**
 * Backfill existing breeders with google_review_count and business_type
 * from Google Places API (New).
 *
 * Run with: GOOGLE_PLACES_API_KEY=xxx node scripts/backfill-google-data.js
 */

const { getSupabaseAdmin, getGooglePlacesApiKey } = require("./_env");

const supabase = getSupabaseAdmin();
const GOOGLE_API_KEY = getGooglePlacesApiKey();

async function fetchPlaceDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "rating,userRatingCount,primaryType,types",
      },
    });
    if (!res.ok) {
      console.error(`  API error ${res.status} for ${placeId}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`  Fetch error for ${placeId}:`, err.message);
    return null;
  }
}

async function main() {
  console.log("=== Backfilling Google Place Data ===\n");

  // Fetch breeders that have a google_place_id but missing review_count or business_type
  let allBreeders = [];
  let from = 0;
  const batchSize = 1000;
  while (true) {
    const { data: batch, error } = await supabase
      .from("breeders")
      .select("id, slug, name, google_place_id, google_review_count, business_type")
      .neq("status", "archived")
      .not("google_place_id", "is", null)
      .range(from, from + batchSize - 1);

    if (error) {
      console.error("Error:", error);
      process.exit(1);
    }
    if (!batch || batch.length === 0) break;
    allBreeders = allBreeders.concat(batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }

  // Only process breeders missing the new fields
  const toUpdate = allBreeders.filter(
    b => b.google_review_count == null || b.business_type == null
  );

  console.log(`Breeders with Google Place ID: ${allBreeders.length}`);
  console.log(`Need backfill (missing review_count or business_type): ${toUpdate.length}\n`);

  if (toUpdate.length === 0) {
    console.log("Nothing to backfill. All breeders already have the data.");
    return;
  }

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < toUpdate.length; i++) {
    const b = toUpdate[i];
    console.log(`[${i + 1}/${toUpdate.length}] ${b.name}`);

    const details = await fetchPlaceDetails(b.google_place_id);
    if (!details) {
      failed++;
      continue;
    }

    const updateData = {};
    if (b.google_review_count == null && details.userRatingCount != null) {
      updateData.google_review_count = details.userRatingCount;
    }
    if (b.business_type == null) {
      updateData.business_type = details.primaryType || (details.types && details.types[0]) || null;
    }

    if (Object.keys(updateData).length === 0) {
      console.log(`  No new data to update`);
      skipped++;
      continue;
    }

    const { error } = await supabase
      .from("breeders")
      .update(updateData)
      .eq("id", b.id);

    if (error) {
      console.error(`  Update error:`, error.message);
      failed++;
    } else {
      console.log(`  Updated:`, JSON.stringify(updateData));
      updated++;
    }

    // Rate limit: 100ms between requests
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch(console.error);
