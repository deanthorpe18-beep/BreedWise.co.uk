/**
 * Discover UK cat breeders via Google Business / Places — cache everything in Supabase.
 *
 * - Skips place IDs already in the database (0 duplicate API work)
 * - Caches full place payloads in google_places_cache
 * - Downloads photos once into breeder-photos storage
 * - Uses search results directly when they include photos (avoids extra Details calls)
 *
 * Usage:
 *   node scripts/seed-cat-breeders.js
 *   node scripts/seed-cat-breeders.js --limit=50
 *   node scripts/seed-cat-breeders.js --dry-run
 */

require("./_env");

const { getSupabaseAdmin, getGooglePlacesApiKey } = require("./_env");
const { locationFromPlace, extractPostcode, isUkLocation } = require("./address-utils");
const { UK_SEARCH_LOCATIONS } = require("./uk-search-locations");
const { loadExistingBreederKeys } = require("./seed-common");

const SEARCH_LOCATIONS = UK_SEARCH_LOCATIONS;

const CAT_QUERIES = [
  "cat breeder",
  "kitten breeder",
  "cattery",
  "ragdoll breeder",
  "british shorthair breeder",
  "bengal cat breeder",
  "maine coon breeder",
  "persian cat breeder",
  "siamese cat breeder",
  "sphynx cat breeder",
  "scottish fold breeder",
  "ragdoll kittens",
  "birman breeder",
  "burmese cat breeder",
  "norwegian forest cat breeder",
  "devon rex breeder",
  "siberian cat breeder",
  "oriental shorthair breeder",
  "pedigree cat breeder",
  "gccf registered cattery",
];

const CAT_BREED_KEYWORDS = [
  { keywords: ["ragdoll"], breed: "Ragdoll" },
  { keywords: ["british shorthair", "british blue"], breed: "British Shorthair" },
  { keywords: ["bengal"], breed: "Bengal" },
  { keywords: ["maine coon"], breed: "Maine Coon" },
  { keywords: ["persian"], breed: "Persian" },
  { keywords: ["siamese"], breed: "Siamese" },
  { keywords: ["sphynx"], breed: "Sphynx" },
  { keywords: ["scottish fold"], breed: "Scottish Fold" },
];

const REJECT_KEYWORDS = [
  "veterinary", "vet ", "animal hospital", "pet shop", "pet store",
  "grooming", "groomer", "boarding", "rescue", "rehoming", "sanctuary",
  "charity", "rspca", "cats protection", "cattery boarding", "cattery hotel",
  "pet supplies", "pet sitting", "dog", "puppy", "kennel",
];

function generateSlug(name, postcode, town) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const cleanLocation = (postcode || town || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${cleanName}-${cleanLocation}`.replace(/-+/g, "-").slice(0, 100);
}

function inferCatBreed(name) {
  const lower = name.toLowerCase();
  for (const { keywords, breed } of CAT_BREED_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return breed;
  }
  return null;
}

function isLikelyCatBreeder(place) {
  const name = (place.displayName?.text || "").toLowerCase();
  if (!name || name.length < 3) return false;

  for (const kw of REJECT_KEYWORDS) {
    if (name.includes(kw)) return false;
  }

  const accept = [
    "cat breeder", "cat breeding", "kitten", "kittens", "cattery",
    "ragdoll", "bengal", "maine coon", "british shorthair", "persian",
    "siamese", "sphynx", "scottish fold", "birman", "burmese", "oriental",
    "siberian", "norwegian forest", "devon rex", "cornish rex",
  ];

  return accept.some((kw) => name.includes(kw));
}

async function searchPlaces(apiKey, query, lat, lng, radius) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location,places.photos,places.types,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.editorialSummary,places.primaryType,places.businessStatus",
    },
    body: JSON.stringify({
      textQuery: `${query} near ${lat},${lng} UK`,
      locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius } },
    }),
  });

  if (!res.ok) return { places: [], apiCalls: 1 };
  const data = await res.json();
  return { places: data.places || [], apiCalls: 1 };
}

async function main() {
  const {
    savePlaceCache,
    normaliseSearchPlace,
    syncPhotosForBreeder,
    getPlaceDetails,
    buildMetadataUpdate,
  } = await import("../lib/google-places-sync.js");

  const args = process.argv.slice(2);
  const maxNew = parseInt(args.find((a) => a.startsWith("--limit="))?.split("=")[1] || "80", 10);
  const dryRun = args.includes("--dry-run");

  const maxSearches = parseInt(
    args.find((a) => a.startsWith("--max-searches="))?.split("=")[1] ||
      String(Math.min(SEARCH_LOCATIONS.length * CAT_QUERIES.length, maxNew * 8)),
    10
  );

  const supabase = getSupabaseAdmin();
  const apiKey = getGooglePlacesApiKey();

  console.log("=== UK Cat Breeder Discovery (cache-first) ===\n");

  const existing = await loadExistingBreederKeys(supabase);

  const seenPlaceIds = new Set(existing.map((b) => b.google_place_id).filter(Boolean));
  const seenSlugs = new Set(existing.map((b) => b.slug).filter(Boolean));

  console.log(`Existing breeders: ${existing.length}`);
  console.log(`Search hubs: ${SEARCH_LOCATIONS.length}, queries: ${CAT_QUERIES.length}, max searches: ${maxSearches}`);
  console.log(`Target new cat breeders: up to ${maxNew}\n`);

  const candidates = [];
  let searchApiCalls = 0;

  for (const loc of SEARCH_LOCATIONS) {
    if (candidates.length >= maxNew * 2) break;
    if (searchApiCalls >= maxSearches) break;

    for (const query of CAT_QUERIES) {
      if (candidates.length >= maxNew * 2) break;
      if (searchApiCalls >= maxSearches) break;

      const { places, apiCalls } = await searchPlaces(apiKey, query, loc.lat, loc.lng, loc.radius);
      searchApiCalls += apiCalls;

      for (const place of places) {
        if (seenPlaceIds.has(place.id)) continue;
        if (!isLikelyCatBreeder(place)) continue;

        const geo = locationFromPlace(place, loc.town);
        if (!isUkLocation({ country: geo.country, postcode: geo.postcode, lat: place.location?.latitude, lng: place.location?.longitude, address: place.formattedAddress })) {
          continue;
        }

        seenPlaceIds.add(place.id);
        candidates.push({ place, loc, query });
      }

      if (searchApiCalls % 50 === 0) {
        console.log(`  … ${searchApiCalls} searches, ${candidates.length} candidates (${loc.town})`);
      }

      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`Search API calls: ${searchApiCalls}`);
  console.log(`Unique cat breeder candidates: ${candidates.length}\n`);

  let inserted = 0;
  let placeDetailCalls = 0;
  let photoCalls = 0;

  for (const { place, loc } of candidates.slice(0, maxNew)) {
    const normalised = normaliseSearchPlace(place);
    await savePlaceCache(supabase, place.id, normalised);

    let details = normalised;
    if (!details.photos?.length || !details.addressComponents?.length || !details.reviews?.length) {
      const result = await getPlaceDetails(supabase, apiKey, place.id);
      placeDetailCalls += result.fromCache ? 0 : 1;
      if (result.data) details = result.data;
    }

    const name = place.displayName?.text || details.displayName?.text || "Unknown Cattery";
    const address = details.formattedAddress || place.formattedAddress || "";
    const geo = locationFromPlace(details.addressComponents?.length ? details : place, loc.town);
    const postcode = geo.postcode || extractPostcode(address);
    const { town, county, region, country } = geo;

    if (!isUkLocation({ country, postcode, lat: details.location?.latitude || place.location?.latitude, lng: details.location?.longitude || place.location?.longitude, address })) {
      console.log(`✗ ${name}: skipped (not UK — ${country || "unknown country"})`);
      continue;
    }

    let slug = generateSlug(name, postcode, town);

    if (seenSlugs.has(slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    seenSlugs.add(slug);

    const inferredBreed = inferCatBreed(name);

    const row = {
      google_place_id: place.id,
      slug,
      name,
      address: address || null,
      town,
      postcode,
      county,
      region,
      country,
      lat: details.location?.latitude || place.location?.latitude || null,
      lng: details.location?.longitude || place.location?.longitude || null,
      website: details.websiteUri || place.websiteUri || null,
      phone: details.nationalPhoneNumber || place.nationalPhoneNumber || place.internationalPhoneNumber || null,
      google_rating: (details.rating ?? place.rating) != null ? Number(details.rating ?? place.rating) : null,
      google_review_count: (details.userRatingCount ?? place.userRatingCount) != null ? Number(details.userRatingCount ?? place.userRatingCount) : null,
      business_type: details.primaryType || place.primaryType || place.types?.[0] || "cattery",
      status: "public_listing",
      source_tags: ["google_places", "cat_breeder"],
      confidence_score: 0.9,
      about: details.editorialSummary?.text || place.editorialSummary?.text || null,
      last_updated_at: new Date().toISOString(),
    };

    if (dryRun) {
      console.log(`[dry-run] Would insert: ${name} → /breeder/${slug}${inferredBreed ? ` (${inferredBreed})` : ""}`);
      inserted++;
      continue;
    }

    let insertedRow = null;
    let insertSlug = slug;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error: insertErr } = await supabase
        .from("breeders")
        .insert({ ...row, slug: insertSlug })
        .select("id, slug")
        .single();

      if (!insertErr) {
        insertedRow = data;
        slug = insertSlug;
        break;
      }
      if (insertErr.message.includes("breeders_slug_key") && attempt < 2) {
        insertSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        continue;
      }
      console.log(`✗ ${name}: ${insertErr.message}`);
      break;
    }

    if (!insertedRow) continue;

    if (inferredBreed) {
      await supabase.from("breeder_breeds").upsert(
        {
          breeder_id: insertedRow.id,
          breed: inferredBreed,
          animal_type: "cat",
        },
        { onConflict: "breeder_id,breed,animal_type" }
      );
    } else {
      await supabase.from("breeder_breeds").upsert(
        {
          breeder_id: insertedRow.id,
          breed: "Mixed / Various",
          animal_type: "cat",
        },
        { onConflict: "breeder_id,breed,animal_type" }
      );
    }

    const meta = buildMetadataUpdate(details);
    if (meta) {
      await supabase.from("breeders").update(meta).eq("id", insertedRow.id);
    }

    const { apiCalls } = await syncPhotosForBreeder(supabase, apiKey, insertedRow, details.photos);
    photoCalls += apiCalls;

    inserted++;
    console.log(`✓ ${name} → /breeder/${slug}${inferredBreed ? ` (${inferredBreed})` : ""} — ${apiCalls} photo API call(s)`);

    await new Promise((r) => setTimeout(r, 250));
  }

  console.log("\n=== Summary ===");
  console.log(`New cat breeders:     ${inserted}`);
  console.log(`Text Search API:      ${searchApiCalls}`);
  console.log(`Place Details API:    ${placeDetailCalls}`);
  console.log(`Place Photo API:      ${photoCalls}`);
  console.log(`Total Google API:     ${searchApiCalls + placeDetailCalls + photoCalls}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
