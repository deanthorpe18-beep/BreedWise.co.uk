/**
 * Focused West Sussex Dog Breeder Seeder
 *
 * Searches comprehensively across ALL West Sussex towns and villages.
 * Uses Google Places API (New) with multiple query types per location.
 *
 * Run with: GOOGLE_PLACES_API_KEY=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-west-sussex-focused.js
 */

const { getSupabaseAdmin, getGooglePlacesApiKey } = require("./_env");

const supabase = getSupabaseAdmin();
const GOOGLE_API_KEY = getGooglePlacesApiKey();

// Comprehensive West Sussex search locations with lat/lng
// Major towns first, then smaller villages
const SEARCH_LOCATIONS = [
  // === MAJOR TOWNS (search with larger radius) ===
  { town: "Chichester", lat: 50.8369, lng: -0.7795, radius: 15000 },
  { town: "Worthing", lat: 50.8170, lng: -0.3750, radius: 15000 },
  { town: "Crawley", lat: 51.1091, lng: -0.1872, radius: 15000 },
  { town: "Horsham", lat: 51.0620, lng: -0.3245, radius: 15000 },
  { town: "Haywards Heath", lat: 50.9957, lng: -0.1112, radius: 12000 },
  { town: "Bognor Regis", lat: 50.7873, lng: -0.6710, radius: 12000 },
  { town: "Littlehampton", lat: 50.8127, lng: -0.5433, radius: 12000 },
  { town: "Shoreham-by-Sea", lat: 50.8351, lng: -0.2896, radius: 10000 },
  { town: "Burgess Hill", lat: 50.9577, lng: -0.1521, radius: 10000 },
  { town: "East Grinstead", lat: 51.1240, lng: -0.0050, radius: 12000 },

  // === MEDIUM TOWNS ===
  { town: "Southwick", lat: 50.8364, lng: -0.2360, radius: 8000 },
  { town: "Lancing", lat: 50.8266, lng: -0.3284, radius: 8000 },
  { town: "Steyning", lat: 50.8589, lng: -0.3258, radius: 8000 },
  { town: "Henfield", lat: 50.9417, lng: -0.3439, radius: 8000 },
  { town: "Pulborough", lat: 50.9569, lng: -0.6111, radius: 10000 },
  { town: "Billingshurst", lat: 50.9795, lng: -0.5330, radius: 10000 },
  { town: "Arundel", lat: 50.8552, lng: -0.5557, radius: 8000 },
  { town: "Midhurst", lat: 50.9893, lng: -0.7352, radius: 12000 },
  { town: "Petworth", lat: 50.9770, lng: -0.6052, radius: 10000 },
  { town: "Selsey", lat: 50.7389, lng: -0.7656, radius: 8000 },
  { town: "Rustington", lat: 50.8288, lng: -0.4700, radius: 8000 },
  { town: "Angmering", lat: 50.8288, lng: -0.4655, radius: 8000 },
  { town: "East Preston", lat: 50.8231, lng: -0.4258, radius: 6000 },
  { town: "Ferring", lat: 50.8200, lng: -0.4500, radius: 5000 },
  { town: "Goring-by-Sea", lat: 50.8286, lng: -0.4224, radius: 6000 },
  { town: "Southwater", lat: 51.0411, lng: -0.3519, radius: 8000 },
  { town: "Storrington", lat: 50.9515, lng: -0.4928, radius: 8000 },
  { town: "Partridge Green", lat: 50.9380, lng: -0.3870, radius: 6000 },
  { town: "Cowfold", lat: 50.9950, lng: -0.2720, radius: 6000 },
  { town: "Balcombe", lat: 51.0600, lng: -0.1400, radius: 6000 },
  { town: "Copthorne", lat: 51.1370, lng: -0.0906, radius: 6000 },
  { town: "Turners Hill", lat: 51.0950, lng: -0.0850, radius: 6000 },
  { town: "Handcross", lat: 51.0550, lng: -0.2050, radius: 6000 },
  { town: "Felpham", lat: 50.7950, lng: -0.6450, radius: 6000 },
  { town: "Aldwick", lat: 50.7850, lng: -0.6950, radius: 6000 },
  { town: "North Bersted", lat: 50.8000, lng: -0.6750, radius: 5000 },
  { town: "Pagham", lat: 50.7700, lng: -0.7400, radius: 6000 },
  { town: "Birdham", lat: 50.7900, lng: -0.8350, radius: 5000 },
  { town: "Bosham", lat: 50.8300, lng: -0.8550, radius: 5000 },
  { town: "Fishbourne", lat: 50.8450, lng: -0.8150, radius: 5000 },
  { town: "Lavant", lat: 50.8650, lng: -0.7850, radius: 5000 },
  { town: "Westhampnett", lat: 50.8550, lng: -0.7450, radius: 5000 },
  { town: "Boxgrove", lat: 50.8600, lng: -0.7100, radius: 5000 },
  { town: "Oving", lat: 50.8350, lng: -0.7250, radius: 5000 },
  { town: "Tangmere", lat: 50.8450, lng: -0.7150, radius: 5000 },
  { town: "Singleton", lat: 50.9050, lng: -0.7550, radius: 5000 },
  { town: "West Dean", lat: 50.9100, lng: -0.7800, radius: 5000 },
  { town: "East Dean", lat: 50.9150, lng: -0.7100, radius: 5000 },
  { town: "Slindon", lat: 50.8700, lng: -0.6350, radius: 5000 },
  { town: "Walberton", lat: 50.8250, lng: -0.6150, radius: 5000 },
  { town: "Yapton", lat: 50.8150, lng: -0.6100, radius: 5000 },
  { town: "Barnham", lat: 50.8300, lng: -0.6350, radius: 5000 },
  { town: "Eastergate", lat: 50.8400, lng: -0.6500, radius: 5000 },
  { town: "Westergate", lat: 50.8540, lng: -0.5763, radius: 5000 },
  { town: "Fontwell", lat: 50.8550, lng: -0.6500, radius: 5000 },
  { town: "Bury", lat: 50.9050, lng: -0.5650, radius: 5000 },
  { town: "Amberley", lat: 50.9100, lng: -0.5400, radius: 5000 },
  { town: "Thakeham", lat: 50.9350, lng: -0.4150, radius: 5000 },
  { town: "Ashington", lat: 50.9200, lng: -0.3850, radius: 5000 },
  { town: "Washington", lat: 50.9050, lng: -0.4050, radius: 5000 },
  { town: "Findon", lat: 50.8650, lng: -0.4050, radius: 5000 },
  { town: "Clapham", lat: 50.8450, lng: -0.4550, radius: 5000 },
  { town: "Patching", lat: 50.8350, lng: -0.4450, radius: 5000 },
  { town: "Durrington", lat: 50.8200, lng: -0.4100, radius: 5000 },
  { town: "Salvington", lat: 50.8150, lng: -0.3900, radius: 5000 },
  { town: "Tarring", lat: 50.8100, lng: -0.3800, radius: 5000 },
  { town: "Broadwater", lat: 50.8250, lng: -0.3700, radius: 5000 },
  { town: "Sompting", lat: 50.8350, lng: -0.3500, radius: 5000 },
  { town: "Coombes", lat: 50.8450, lng: -0.3400, radius: 5000 },
  { town: "Botolphs", lat: 50.8550, lng: -0.3050, radius: 5000 },
  { town: "Bramber", lat: 50.8850, lng: -0.3150, radius: 5000 },
  { town: "Upper Beeding", lat: 50.8950, lng: -0.2950, radius: 5000 },
  { town: "Woodmancote", lat: 50.9250, lng: -0.2750, radius: 5000 },
  { town: "Shermanbury", lat: 50.9550, lng: -0.2850, radius: 5000 },
  { town: "West Grinstead", lat: 50.9850, lng: -0.2650, radius: 5000 },
  { town: "Dial Post", lat: 50.9650, lng: -0.2550, radius: 5000 },
  { town: "Ashurst", lat: 50.9350, lng: -0.3250, radius: 5000 },
  { town: "Itchingfield", lat: 51.0400, lng: -0.3500, radius: 5000 },
  { town: "Shipley", lat: 51.0000, lng: -0.3800, radius: 5000 },
  { town: "Coolham", lat: 51.0250, lng: -0.3650, radius: 5000 },
  { town: "Dragon's Green", lat: 51.0150, lng: -0.3250, radius: 5000 },
  { town: "Lower Beeding", lat: 51.0150, lng: -0.2550, radius: 5000 },
  { town: "Plaistow", lat: 51.0650, lng: -0.3250, radius: 5000 },
  { town: "Kirdford", lat: 51.0250, lng: -0.5550, radius: 5000 },
  { town: "Wisborough Green", lat: 51.0200, lng: -0.5150, radius: 5000 },
  { town: "Loxwood", lat: 51.0700, lng: -0.5200, radius: 5000 },
  { town: "Ifold", lat: 51.0750, lng: -0.5350, radius: 5000 },
  { town: "Tisman's Common", lat: 51.0550, lng: -0.5050, radius: 5000 },
];

// Multiple search queries per location to catch different naming conventions
const SEARCH_QUERIES = [
  "dog breeder",
  "puppy breeder",
  "dog kennels",
  "puppy kennel",
  "breeder",
];

// Breed-specific searches for popular UK breeds
const BREED_QUERIES = [
  "labrador breeder",
  "cockapoo breeder",
  "cocker spaniel breeder",
  "springer spaniel breeder",
  "golden retriever breeder",
  "border collie breeder",
  "cavapoo breeder",
  "french bulldog breeder",
  "dachshund breeder",
  "german shepherd breeder",
];

const ALL_QUERIES = [...SEARCH_QUERIES, ...BREED_QUERIES];

// Rejection keywords - be LESS strict than before
const REJECT_KEYWORDS = [
  "boarding", "dog hotel", "doggy day care", "daycare", "grooming",
  "rescue centre", "animal rescue", "dog rescue", "rehoming centre",
  "veterinary", "vet clinic", "vet practice", "pet shop", "pet store",
  "pet supplies", "dog trainer", "dog training", "puppy school",
  "pet crematorium", "dog walking", "dog walker",
  "dog sitter", "pet sitting", "animal sanctuary",
  "RSPCA", "Blue Cross", "Battersea", "Dogs Trust",
  "kennel club", "dog show", "agility", "puppy farm",
];

function isBreeder(place) {
  const name = (place.displayName?.text || place.name || "").toLowerCase();
  const types = (place.types || []).map(t => t.toLowerCase());
  const primary = (place.primaryType || "").toLowerCase();

  // Must be a business
  if (!types.includes("establishment")) return false;

  // Reject obvious non-breeders
  for (const kw of REJECT_KEYWORDS) {
    if (name.includes(kw)) return false;
  }

  // Accept if name contains breeder/kennel/puppy keywords
  const breederKeywords = ["breeder", "breeding", "kennel", "puppy", "puppies", "stud"];
  const hasBreederKeyword = breederKeywords.some(kw => name.includes(kw));

  // Also accept if it's a pet_store or veterinary_clinic that has breeder in name
  if (hasBreederKeyword) return true;

  // Accept general pet businesses in rural areas (they might be breeders)
  if (types.includes("pet_store") || types.includes("store")) {
    // Pet stores aren't breeders unless they say so
    return false;
  }

  // If no breeder keyword, be more lenient - accept if it looks like a kennel
  if (name.includes("dog") || name.includes("pup") || name.includes("canine")) {
    return true;
  }

  return false;
}

function parseAddressComponents(place) {
  const components = {};
  for (const c of (place.addressComponents || [])) {
    for (const t of (c.types || [])) {
      components[t] = c.longText;
      components[t + "_short"] = c.shortText;
    }
  }
  return components;
}

function extractPostcode(address) {
  if (!address) return null;
  const match = address.match(/[A-Z]{1,2}\d[A-Z\d]?\s?\d[ABD-HJLNP-UW-Z]{2}/i);
  return match ? match[0].toUpperCase() : null;
}

async function searchGooglePlaces(query, lat, lng, radius) {
  const url = new URL("https://places.googleapis.com/v1/places:searchText");
  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radius,
      },
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location,places.rating,places.userRatingCount,places.websiteUri,places.internationalPhoneNumber,places.primaryType,places.types,places.photos",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Google API error: ${res.status} - ${err}`);
      return [];
    }

    const data = await res.json();
    return data.places || [];
  } catch (err) {
    console.error(`Search error: ${err.message}`);
    return [];
  }
}

async function downloadPhoto(photoName) {
  try {
    const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = res.headers.get("content-type")?.includes("png") ? "png" : "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("breeder-photos").upload(fileName, buffer, {
      contentType: ext === "png" ? "image/png" : "image/jpeg",
    });

    if (error) return null;

    const { data: { publicUrl } } = supabase.storage.from("breeder-photos").getPublicUrl(fileName);
    return publicUrl;
  } catch {
    return null;
  }
}

function generateSlug(name, postcode, town) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const cleanLocation = (postcode || town || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${cleanName}-${cleanLocation}`.replace(/-+/g, "-").slice(0, 100);
}

async function main() {
  console.log("=== West Sussex Focused Breeder Seeder ===\n");
  console.log(`Searching ${SEARCH_LOCATIONS.length} locations`);
  console.log(`Using ${ALL_QUERIES.length} query types per location`);
  console.log(`Total searches: ${SEARCH_LOCATIONS.length * ALL_QUERIES.length}\n`);

  const seenPlaceIds = new Set();
  const seenSlugs = new Set();
  const breeders = [];
  let searchesDone = 0;
  let apiErrors = 0;

  // Get existing place IDs and slugs to avoid duplicates
  const { data: existing } = await supabase.from("breeders").select("google_place_id, slug, status").neq("status", "archived");
  existing?.forEach(b => {
    if (b.google_place_id) seenPlaceIds.add(b.google_place_id);
    if (b.slug) seenSlugs.add(b.slug);
  });
  console.log(`Existing active breeders: ${existing?.length || 0}`);
  console.log(`Existing place IDs: ${seenPlaceIds.size}`);

  for (const loc of SEARCH_LOCATIONS) {
    console.log(`\n--- ${loc.town} (${loc.radius}m radius) ---`);
    const locBreeders = [];

    for (const query of ALL_QUERIES) {
      const fullQuery = `${query} near ${loc.town}, West Sussex`;
      const places = await searchGooglePlaces(fullQuery, loc.lat, loc.lng, loc.radius);
      searchesDone++;

      for (const place of places) {
        if (seenPlaceIds.has(place.id)) continue;
        if (!isBreeder(place)) continue;

        const components = parseAddressComponents(place);
        const address = place.formattedAddress || "";
        const postcode = extractPostcode(address);
        const town = components.locality || components.sublocality || loc.town;
        const name = place.displayName?.text || place.name || "Unknown Breeder";
        const slug = generateSlug(name, postcode, town);

        if (seenSlugs.has(slug)) continue;

        seenPlaceIds.add(place.id);
        seenSlugs.add(slug);

        const breeder = {
          google_place_id: place.id,
          slug,
          name,
          address,
          town,
          postcode,
          county: "West Sussex",
          region: "South East",
          country: "england",
          lat: place.location?.latitude || null,
          lng: place.location?.longitude || null,
          website: place.websiteUri || null,
          phone: place.internationalPhoneNumber || null,
          google_rating: place.rating || null,
          status: "public_listing",
          source_tags: ["google_places", "west_sussex_focused"],
          confidence_score: 0.9,
        };

        locBreeders.push(breeder);
        breeders.push(breeder);
      }

      // Rate limiting - be nice to Google
      await new Promise(r => setTimeout(r, 200));
    }

    console.log(`  Found ${locBreeders.length} new breeders`);
    console.log(`  Progress: ${searchesDone}/${SEARCH_LOCATIONS.length * ALL_QUERIES.length} searches`);
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total searches: ${searchesDone}`);
  console.log(`API errors: ${apiErrors}`);
  console.log(`New breeders found: ${breeders.length}`);

  if (breeders.length === 0) {
    console.log("\nNo new breeders found.");
    return;
  }

  // Insert breeders
  console.log("\nInserting breeders into database...");
  let inserted = 0;
  const batchSize = 20;

  for (let i = 0; i < breeders.length; i += batchSize) {
    const batch = breeders.slice(i, i + batchSize);
    const { error } = await supabase.from("breeders").insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${breeders.length}...`);
    }
  }

  // Download photos for top breeders
  console.log("\nDownloading photos...");
  const { data: newBreeders } = await supabase
    .from("breeders")
    .select("id, google_place_id")
    .eq("status", "public_listing")
    .contains("source_tags", ["west_sussex_focused"]);

  let photosDownloaded = 0;
  const photoLimit = 500; // Don't exceed storage

  for (const breeder of (newBreeders || []).slice(0, photoLimit)) {
    // We need to re-fetch from Google to get photos
    // This is expensive - skip for now, photos can be added later
  }

  console.log(`\nDone!`);
  console.log(`New breeders inserted: ${inserted}`);
  console.log(`Total active breeders now: ${(existing?.length || 0) + inserted}`);
}

main().catch(console.error);
