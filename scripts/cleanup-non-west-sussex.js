/**
 * Archive all breeders that are NOT in West Sussex.
 * This focuses the site purely on West Sussex.
 *
 * Run with: node scripts/cleanup-non-west-sussex.js
 */

const { getSupabaseAdmin } = require("./_env");

const supabase = getSupabaseAdmin();

// Towns we consider to be in West Sussex
// Strict West Sussex bounds (lat/lng)
// North: ~51.15 (Crawley/Gatwick), South: ~50.73 (Selsey)
// West: ~-0.85 (Chichester), East: ~-0.08 (East Grinstead/Balcombe)
const WS_BOUNDS = {
  minLat: 50.73,
  maxLat: 51.15,
  minLng: -0.85,
  maxLng: -0.08,
};

// Towns we know are in West Sussex
const WS_TOWNS = new Set([
  "chichester", "worthing", "crawley", "horsham", "haywards heath",
  "burgess hill", "bognor regis", "littlehampton", "shoreham-by-sea",
  "southwick", "lancing", "east grinstead", "pulborough", "steyning",
  "arundel", "midhurst", "petworth", "selsey", "billingshurst",
  "rustington", "angmering", "east preston", "ferring", "goring-by-sea",
  "henfield", "southwater", "storrington", "partridge green", "cowfold",
  "balcombe", "handcross", "turners hill", "copthorne", "felpham",
  "aldwick", "north bersted", "pagham", "sidlesham", "birdham",
  "bosham", "fishbourne", "lavant", "westhampnett", "tangmere",
  "oving", "boxgrove", "singleton", "west dean", "east dean",
  "slindon", "walberton", "yapton", "barnham", "eastergate",
  "westergate", "fontwell", "bury", "amberley", "thakeham",
  "ashington", "washington", "findon", "clapham", "patching",
  "durrington", "salvington", "tarring", "broadwater", "sompting",
  "coombes", "botolphs", "bramber", "upper beeding", "woodmancote",
  "shermanbury", "west grinstead", "dial post", "ashurst", "itchingfield",
  "shipley", "coolham", "dragon's green", "lower beeding", "plaistow",
  "kirdford", "wisborough green", "loxwood", "ifold", "tisman's common",
]);

function isWestSussex(b) {
  // 1. Strict lat/lng check
  if (b.lat && b.lng) {
    const inBounds = b.lat >= WS_BOUNDS.minLat && b.lat <= WS_BOUNDS.maxLat &&
                     b.lng >= WS_BOUNDS.minLng && b.lng <= WS_BOUNDS.maxLng;
    if (!inBounds) return false;
  }

  // 2. Town name check
  const t = (b.town || "").toLowerCase().trim();
  for (const ws of WS_TOWNS) {
    if (t.includes(ws)) return true;
  }

  // 3. If we have lat/lng and it passed bounds, it's in
  if (b.lat && b.lng) return true;

  return false;
}

async function main() {
  console.log("Fetching all breeders...");
  const { data: breeders, error } = await supabase
    .from("breeders")
    .select("id, slug, name, town, county, postcode, address, lat, lng")
    .neq("status", "archived");

  if (error) {
    console.error("Error fetching breeders:", error);
    process.exit(1);
  }

  console.log(`Total breeders: ${breeders.length}`);

  const westSussex = [];
  const nonWestSussex = [];

  for (const b of breeders) {
    if (isWestSussex(b)) {
      westSussex.push(b);
    } else {
      nonWestSussex.push(b);
    }
  }

  console.log(`\nWest Sussex breeders: ${westSussex.length}`);
  console.log(`Non-West-Sussex breeders to archive: ${nonWestSussex.length}`);

  if (nonWestSussex.length === 0) {
    console.log("\nNothing to archive. All breeders are already in West Sussex.");
    return;
  }

  // Show a sample of what will be archived
  console.log("\nSample of breeders to be archived:");
  nonWestSussex.slice(0, 10).forEach(b => {
    console.log(`  - ${b.name} | ${b.town} | ${b.county} | ${b.postcode || 'no postcode'}`);
  });
  if (nonWestSussex.length > 10) {
    console.log(`  ... and ${nonWestSussex.length - 10} more`);
  }

  // Confirm before archiving
  console.log("\nTo archive these breeders, run this script with CONFIRM=1");
  console.log("Example: CONFIRM=1 node scripts/cleanup-non-west-sussex.js");

  if (process.env.CONFIRM !== "1") {
    console.log("\nAborted. Set CONFIRM=1 to proceed.");
    return;
  }

  // Archive in batches
  const batchSize = 50;
  let archived = 0;

  for (let i = 0; i < nonWestSussex.length; i += batchSize) {
    const batch = nonWestSussex.slice(i, i + batchSize);
    const ids = batch.map(b => b.id);

    const { error: updateError } = await supabase
      .from("breeders")
      .update({ status: "archived", last_updated_at: new Date().toISOString() })
      .in("id", ids);

    if (updateError) {
      console.error(`Error archiving batch ${i / batchSize + 1}:`, updateError);
    } else {
      archived += batch.length;
      console.log(`Archived ${archived}/${nonWestSussex.length}...`);
    }
  }

  // Update West Sussex breeders to have proper county
  console.log("\nUpdating West Sussex breeders with correct county...");
  const wsIds = westSussex.map(b => b.id);

  for (let i = 0; i < wsIds.length; i += batchSize) {
    const batch = wsIds.slice(i, i + batchSize);
    const { error: countyError } = await supabase
      .from("breeders")
      .update({ county: "West Sussex", last_updated_at: new Date().toISOString() })
      .in("id", batch);

    if (countyError) {
      console.error(`Error updating county batch:`, countyError);
    } else {
      console.log(`Updated county for ${Math.min(i + batchSize, wsIds.length)}/${wsIds.length}...`);
    }
  }

  console.log("\nDone!");
  console.log(`Archived: ${archived} breeders`);
  console.log(`Updated county: ${westSussex.length} breeders now set to "West Sussex"`);
  console.log(`Remaining active breeders: ${westSussex.length}`);
}

main().catch(console.error);
