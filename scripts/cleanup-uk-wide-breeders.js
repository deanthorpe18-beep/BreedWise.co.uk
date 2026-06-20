/**
 * Clean up UK-wide seeded breeders:
 * 1. Remove obvious non-dog breeders (boarding, rescue, grooming, etc.)
 * 2. Remove catteries, pigeon clubs, pet shops, vets
 * 3. Remove duplicate-sounding names (same location, very similar name)
 * 4. Flag breeders with suspiciously low confidence
 *
 * Run with: CONFIRM=1 node scripts/cleanup-uk-wide-breeders.js
 */

const { getSupabaseAdmin } = require("./_env");

const supabase = getSupabaseAdmin();

// Strict reject keywords for non-breeders
const REJECT_KEYWORDS = [
  // Boarding / daycare
  "boarding", "dog hotel", "doggy day care", "doggy daycare", "daycare", "day care",
  "dog sitting", "pet sitting", "dog sitter", "pet sitter", "home boarding",
  // Rescue / sanctuary
  "rescue", "sanctuary", "rehoming", "animal rescue", "dog rescue", "charity",
  // Grooming
  "grooming", "groomer", "dog wash", "hydrobath", "kutz", "cuts",
  // Training / behaviour
  "dog trainer", "dog training", "puppy school", "puppy classes", "obedience",
  "behaviour", "behaviorist", "agility",
  // Other animals
  "cattery", "cat hotel", "pigeon", "racing pigeon", "bird", "parrot",
  "rabbit", "guinea pig", "hamster", "reptile", "exotic",
  // Retail / services
  "pet shop", "pet store", "pet supplies", "pet food", "puppy store", "puppy shop", "store", "shop",
  "vet", "veterinary", "veterinarian", "clinic", "surgery",
  "microchipping", "scanning", "pet passport",
  // Events / clubs
  "dog show", "kennel club", "breed club", "dog club",
  // Misc
  "pet crematorium", "cremation", "funeral",
  "dog walker", "dog walking",
  "tlc", "retreat", "holiday", "holidays", "spa",
  "pet taxi", "pet transport",
  "insurance", "pet insurance",
  "fun park", "dog park", "play park", "activity centre",
  "puppy yoga", "puppy cafe",
];

// Less strict - flag for manual review
const SUSPICIOUS_KEYWORDS = [
  "puppy farm", "puppy mill", "commercial breeding",
  "wholesale", "dealer", "broker",
];

function shouldReject(name) {
  const n = name.toLowerCase();
  for (const kw of REJECT_KEYWORDS) {
    if (n.includes(kw)) return kw;
  }
  return null;
}

function isSuspicious(name) {
  const n = name.toLowerCase();
  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (n.includes(kw)) return kw;
  }
  return null;
}

function normalizeName(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/(kennels|stud|dogs|puppies|breeders)/g, '');
}

async function main() {
  console.log("=== UK-Wide Breeder Cleanup ===\n");

  // Fetch all non-archived breeders (paginate since Supabase limits to 1000)
  let allBreeders = [];
  let from = 0;
  const batchSize = 1000;
  while (true) {
    const { data: batch, error } = await supabase
      .from("breeders")
      .select("id, slug, name, town, lat, lng, postcode, county, google_rating, status, source_tags")
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .range(from, from + batchSize - 1);

    if (error) {
      console.error("Error fetching breeders:", error);
      process.exit(1);
    }
    if (!batch || batch.length === 0) break;
    allBreeders = allBreeders.concat(batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }
  console.log(`Total active breeders: ${allBreeders.length}\n`);
  const breeders = allBreeders;

  const toArchive = [];
  const toReview = [];
  const toKeep = [];
  const seenNormalized = new Map(); // For duplicate detection

  for (const b of breeders) {
    const name = b.name || "";
    const town = b.town || "";

    // 1. Check for obvious reject keywords
    const rejectKw = shouldReject(name);
    if (rejectKw) {
      toArchive.push({ ...b, reason: `contains "${rejectKw}"` });
      continue;
    }

    // 2. Check for suspicious keywords (flag but don't auto-archive)
    const suspiciousKw = isSuspicious(name);
    if (suspiciousKw) {
      toReview.push({ ...b, reason: `suspicious: "${suspiciousKw}"` });
      // Continue to also check duplicates
    }

    // 3. Duplicate detection: same town, very similar normalized name
    const norm = normalizeName(name);
    const key = `${town.toLowerCase().trim()}_${norm}`;
    if (seenNormalized.has(key)) {
      const existing = seenNormalized.get(key);
      // Keep the one with higher rating or more complete data
      const keepThis = (b.google_rating || 0) >= (existing.google_rating || 0);
      if (keepThis) {
        toArchive.push({ ...existing, reason: `duplicate of ${b.name}` });
        seenNormalized.set(key, b);
      } else {
        toArchive.push({ ...b, reason: `duplicate of ${existing.name}` });
      }
      continue;
    }
    seenNormalized.set(key, b);

    // 4. Check for obviously wrong locations (outside UK bounding box)
    if (b.lat && b.lng) {
      if (b.lat < 49.5 || b.lat > 61 || b.lng < -8.5 || b.lng > 1.8) {
        toArchive.push({ ...b, reason: `location outside UK (${b.lat}, ${b.lng})` });
        continue;
      }
    }

    // If not rejected, keep
    if (!suspiciousKw) {
      toKeep.push(b);
    }
  }

  console.log(`To archive: ${toArchive.length}`);
  console.log(`To review (suspicious): ${toReview.length}`);
  console.log(`To keep: ${toKeep.length}\n`);

  console.log("--- Sample of breeders to archive ---");
  toArchive.slice(0, 20).forEach(b => {
    console.log(`  [${b.reason}] ${b.name} | ${b.town} | ${b.postcode || 'no postcode'}`);
  });
  if (toArchive.length > 20) {
    console.log(`  ... and ${toArchive.length - 20} more`);
  }

  if (toReview.length > 0) {
    console.log("\n--- Suspicious breeders to review ---");
    toReview.slice(0, 10).forEach(b => {
      console.log(`  [${b.reason}] ${b.name} | ${b.town}`);
    });
  }

  console.log("\n--- Sample of breeders to keep ---");
  toKeep.slice(0, 15).forEach(b => {
    console.log(`  ${b.name} | ${b.town} | ${b.postcode || 'no postcode'}`);
  });
  if (toKeep.length > 15) {
    console.log(`  ... and ${toKeep.length - 15} more`);
  }

  if (process.env.CONFIRM !== "1") {
    console.log("\nSet CONFIRM=1 to proceed with archiving.");
    return;
  }

  // Archive bad breeders
  const archiveBatchSize = 50;
  let archived = 0;

  for (let i = 0; i < toArchive.length; i += archiveBatchSize) {
    const batch = toArchive.slice(i, i + archiveBatchSize);
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
  console.log(`${toReview.length} flagged as suspicious for manual review.`);
}

main().catch(console.error);
