/**
 * Archive breeder listings outside the UK (wrong Google results from US/Canada).
 *
 * Usage:
 *   node scripts/cleanup-non-uk-breeders.js
 *   node scripts/cleanup-non-uk-breeders.js --dry-run
 *   node scripts/cleanup-non-uk-breeders.js --cats
 */

require("./_env");
const { getSupabaseAdmin } = require("./_env");
const { isUkLocation, extractPostcode } = require("./address-utils");

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const catsOnly = process.argv.includes("--cats");

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("breeders")
    .select("id, slug, name, town, country, postcode, lat, lng, address, source_tags")
    .in("status", ["public_listing", "claimed_profile"]);

  if (catsOnly) {
    query = query.contains("source_tags", ["cat_breeder"]);
  }

  const { data: breeders, error } = await query;
  if (error) throw error;

  const toArchive = (breeders || []).filter(
    (b) =>
      !isUkLocation({
        country: b.country,
        postcode: b.postcode || extractPostcode(b.address),
        lat: b.lat,
        lng: b.lng,
        address: b.address,
      })
  );

  console.log(`Checking ${breeders?.length || 0} listings — ${toArchive.length} non-UK${dryRun ? " (dry-run)" : ""}\n`);

  for (const b of toArchive) {
    if (dryRun) {
      console.log(`[dry-run] Would archive: ${b.slug} (${b.name}, ${b.country})`);
      continue;
    }

    const { error: upErr } = await supabase
      .from("breeders")
      .update({ status: "archived", last_updated_at: new Date().toISOString() })
      .eq("id", b.id);

    if (upErr) console.log(`✗ ${b.slug}: ${upErr.message}`);
    else console.log(`✓ Archived ${b.slug} (${b.country})`);
  }

  if (!dryRun) console.log(`\nArchived ${toArchive.length} non-UK listing(s).`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
