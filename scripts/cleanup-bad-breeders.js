/**
 * Clean up newly seeded breeders:
 * 1. Remove obvious non-dog breeders (pigeons, cats, etc.)
 * 2. Remove boarding/daycare/sanctuary/rescue businesses
 * 3. Remove results from clearly wrong regions (Durham, Wales, Scotland, Midlands, etc.)
 * 4. Keep nearby Hampshire/Surrey/Kent results (they're at least in the right region)
 *
 * Run with: CONFIRM=1 node scripts/cleanup-bad-breeders.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zbvwqsjgasgxpphljahs.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpidndxc2pnYXNneHBwaGxqYWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MzQwNywiZXhwIjoyMDk2MjM5NDA3fQ.f9oVqi1wfcFXVg4i6eYtQH1mHxKZIk-mcwmjRuKH0E8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Postcodes that are acceptable (South East + nearby)
const ACCEPTABLE_POSTCODE_AREAS = new Set([
  "PO", "RH", "BN", "GU", "KT", "SO", "ME", "TN", "CT", "SL", "RG",
]);

// Postcodes that are definitely wrong (North, Midlands, Wales, Scotland)
const WRONG_POSTCODE_AREAS = new Set([
  "DH", "DL", "NE", "SR", "TS", "CA", "LA", "DH",  // North East / Cumbria
  "WF", "BD", "HD", "HX", "LS", "HG", "YO",  // Yorkshire
  "M", "OL", "BL", "SK", "WA", "WN",  // Manchester / Lancashire
  "B", "CV", "DY", "WS", "WV", "WR",  // Midlands
  "CF", "NP", "SA", "LL", "SY",  // Wales
  "AB", "DD", "DG", "EH", "FK", "G", "HS", "IV", "KA", "KW", "KY", "ML", "PA", "PH", "TD", "ZE",  // Scotland
  "EX", "TA", "TQ", "TR", "PL",  // Devon/Cornwall (too far)
  "NR", "IP", "PE", "CB",  // East Anglia
  "MK", "NN", "OX", "LE", "NG", "DE", "ST",  // East Midlands
  "CW", "ST", "TF",  // Midlands
  "CH", "L", "PR", "FY",  // North West
  "HU", "DN", "LN", "S",  // Yorkshire/Lincolnshire
  "BS", "BA", "GL", "SN",  // West Country
  "SP", "BH", "DT",  // Dorset/Wiltshire
  "CM", "SS", "CO",  // Essex
  "HP", "LU", "AL",  // Beds/Herts
  "E", "EC", "N", "NW", "SE", "SW", "W", "WC",  // London
]);

// Reject keywords for obvious non-breeders
const REJECT_KEYWORDS = [
  "pigeon", "pigeons", "racing pigeon",
  "cattery", "cat hotel",
  "boarding", "dog hotel", "doggy day care", "daycare", "day care",
  "dog sitting", "pet sitting", "dog sitter", "pet sitter",
  "rescue", "sanctuary", "rehoming", "animal rescue", "dog rescue",
  "scanning", "microchipping", "grooming", "dog walker", "dog walking",
  "dog trainer", "dog training", "puppy school", "puppy classes",
  "vet", "veterinary", "veterinarian",
  "pet shop", "pet store", "pet supplies",
  "dog show", "agility", "obedience",
  "pet crematorium", "cremation",
  "dog club", "kennel club",
  "tlc", "retreat", "holiday", "holidays",
];

function shouldReject(name) {
  const n = name.toLowerCase();
  for (const kw of REJECT_KEYWORDS) {
    if (n.includes(kw)) return kw;
  }
  return null;
}

function getPostcodeArea(postcode) {
  if (!postcode) return null;
  const m = postcode.toUpperCase().match(/^([A-Z]{1,2})/);
  return m ? m[1] : null;
}

async function main() {
  console.log("=== Cleaning Up Bad Breeders ===\n");

  const { data: breeders, error } = await supabase
    .from("breeders")
    .select("id, slug, name, town, lat, lng, postcode, source_tags, status")
    .neq("status", "archived")
    .contains("source_tags", ["west_sussex_focused"]);

  if (error) {
    console.error("Error:", error);
    process.exit(1);
  }

  console.log(`Newly seeded breeders to review: ${breeders.length}\n`);

  const toArchive = [];
  const toKeep = [];

  for (const b of breeders) {
    const name = b.name || "";
    const postcodeArea = getPostcodeArea(b.postcode);
    let reason = null;

    // 1. Check for obvious reject keywords
    const rejectKw = shouldReject(name);
    if (rejectKw) {
      toArchive.push({ ...b, reason: `contains "${rejectKw}"` });
      continue;
    }

    // 2. Check postcode - reject clearly wrong regions
    if (postcodeArea && WRONG_POSTCODE_AREAS.has(postcodeArea)) {
      toArchive.push({ ...b, reason: `wrong postcode area ${postcodeArea}` });
      continue;
    }

    // 3. If no postcode and lat/lng clearly wrong, reject
    if (!postcodeArea && b.lat && b.lng) {
      // Way outside UK south east
      if (b.lat < 50 || b.lat > 52 || b.lng < -3 || b.lng > 1.5) {
        toArchive.push({ ...b, reason: `way out of region (${b.lat}, ${b.lng})` });
        continue;
      }
    }

    toKeep.push(b);
  }

  console.log(`To archive: ${toArchive.length}`);
  console.log(`To keep: ${toKeep.length}\n`);

  console.log("--- Sample of breeders to archive ---");
  toArchive.slice(0, 15).forEach(b => {
    console.log(`  [${b.reason}] ${b.name} | ${b.town} | ${b.postcode || 'no postcode'}`);
  });
  if (toArchive.length > 15) {
    console.log(`  ... and ${toArchive.length - 15} more`);
  }

  console.log("\n--- Sample of breeders to keep ---");
  toKeep.slice(0, 20).forEach(b => {
    console.log(`  ${b.name} | ${b.town} | ${b.postcode || 'no postcode'}`);
  });
  if (toKeep.length > 20) {
    console.log(`  ... and ${toKeep.length - 20} more`);
  }

  if (process.env.CONFIRM !== "1") {
    console.log("\nSet CONFIRM=1 to proceed with archiving.");
    return;
  }

  // Archive bad breeders
  const batchSize = 50;
  let archived = 0;

  for (let i = 0; i < toArchive.length; i += batchSize) {
    const batch = toArchive.slice(i, i + batchSize);
    const ids = batch.map(b => b.id);

    const { error: updateError } = await supabase
      .from("breeders")
      .update({ status: "archived", last_updated_at: new Date().toISOString() })
      .in("id", ids);

    if (updateError) {
      console.error(`Error archiving batch:`, updateError.message);
    } else {
      archived += batch.length;
      console.log(`Archived ${archived}/${toArchive.length}...`);
    }
  }

  console.log(`\nDone! Archived ${archived} bad breeders.`);
  console.log(`Kept ${toKeep.length} good breeders.`);
}

main().catch(console.error);
