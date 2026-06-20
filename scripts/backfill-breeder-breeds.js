/**
 * Backfill breeder_breeds for listings missing animal/breed tags.
 * Dogs default to animal_type=dog; cat_breeder tag → cat.
 *
 * Usage: node scripts/backfill-breeder-breeds.js
 *        node scripts/backfill-breeder-breeds.js --dry-run
 */

require("./_env");
const { getSupabaseAdmin } = require("./_env");
const { BREED_LIST } = require("../lib/breeders");

const CAT_KEYWORDS = [
  { keywords: ["ragdoll"], breed: "Ragdoll" },
  { keywords: ["british shorthair", "british blue"], breed: "British Shorthair" },
  { keywords: ["bengal"], breed: "Bengal" },
  { keywords: ["maine coon"], breed: "Maine Coon" },
  { keywords: ["persian"], breed: "Persian" },
  { keywords: ["siamese"], breed: "Siamese" },
  { keywords: ["sphynx"], breed: "Sphynx" },
  { keywords: ["scottish fold"], breed: "Scottish Fold" },
  { keywords: ["siberian"], breed: "Siberian" },
  { keywords: ["birman"], breed: "Birman" },
  { keywords: ["oriental"], breed: "Oriental" },
];

const DOG_BREEDS_SORTED = [...BREED_LIST].sort((a, b) => b.length - a.length);

function inferBreed(name, animalType) {
  const lower = (name || "").toLowerCase();

  if (animalType === "cat") {
    for (const { keywords, breed } of CAT_KEYWORDS) {
      if (keywords.some((kw) => lower.includes(kw))) return breed;
    }
    return "Mixed / Various";
  }

  for (const breed of DOG_BREEDS_SORTED) {
    if (lower.includes(breed.toLowerCase())) return breed;
  }
  const aliases = [
    { kw: ["gsd", "german shepherd"], breed: "German Shepherd" },
    { kw: ["labrador", "lab "], breed: "Labrador Retriever" },
    { kw: ["golden retriever", "golden "], breed: "Golden Retriever" },
    { kw: ["cocker spaniel"], breed: "Cocker Spaniel" },
    { kw: ["springer spaniel"], breed: "English Springer Spaniel" },
    { kw: ["french bulldog", "frenchie"], breed: "French Bulldog" },
    { kw: ["staffordshire", "staffy", "staffie"], breed: "Staffordshire Bull Terrier" },
    { kw: ["border collie"], breed: "Border Collie" },
    { kw: ["jack russell"], breed: "Jack Russell Terrier" },
    { kw: ["miniature schnauzer"], breed: "Miniature Schnauzer" },
    { kw: ["west highland", "westie"], breed: "West Highland Terrier" },
    { kw: ["bernese"], breed: "Bernese Mountain Dog" },
    { kw: ["boxer"], breed: "Boxer" },
    { kw: ["rottweiler"], breed: "Rottweiler" },
    { kw: ["doberman"], breed: "Doberman" },
    { kw: ["beagle"], breed: "Beagle" },
    { kw: ["whippet"], breed: "Whippet" },
    { kw: ["cockapoo"], breed: "Cockapoo" },
    { kw: ["cavapoo"], breed: "Cavapoo" },
    { kw: ["labradoodle"], breed: "Labradoodle" },
    { kw: ["goldendoodle"], breed: "Goldendoodle" },
    { kw: ["maltipoo"], breed: "Maltipoo" },
  ];
  for (const { kw, breed } of aliases) {
    if (kw.some((k) => lower.includes(k))) return breed;
  }
  return "Mixed / Various";
}

function isCatBreeder(breeder) {
  return (breeder.source_tags || []).includes("cat_breeder");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const supabase = getSupabaseAdmin();

  const { data: breeders, error } = await supabase
    .from("breeders")
    .select("id, name, slug, source_tags, breeder_breeds(id)")
    .in("status", ["public_listing", "claimed_profile"]);

  if (error) throw error;

  const missing = (breeders || []).filter((b) => !b.breeder_breeds?.length);
  console.log(`Breeders missing breeder_breeds: ${missing.length}${dryRun ? " (dry-run)" : ""}\n`);

  let dogs = 0;
  let cats = 0;
  const batch = [];

  for (const b of missing) {
    const animalType = isCatBreeder(b) ? "cat" : "dog";
    const breed = inferBreed(b.name, animalType);
    batch.push({ breeder_id: b.id, breed, animal_type: animalType });
    if (animalType === "cat") cats++;
    else dogs++;
  }

  if (dryRun) {
    console.log(`Would insert: ${dogs} dog, ${cats} cat breed rows`);
    return;
  }

  const chunkSize = 100;
  let inserted = 0;
  for (let i = 0; i < batch.length; i += chunkSize) {
    const chunk = batch.slice(i, i + chunkSize);
    const { error: upsertErr } = await supabase
      .from("breeder_breeds")
      .upsert(chunk, { onConflict: "breeder_id,breed,animal_type" });
    if (upsertErr) {
      console.error("Batch error:", upsertErr.message);
    } else {
      inserted += chunk.length;
      console.log(`Upserted ${inserted}/${batch.length}...`);
    }
  }

  console.log(`\nDone: ${inserted} rows (${dogs} dog, ${cats} cat)`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
