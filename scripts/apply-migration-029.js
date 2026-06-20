/**
 * Apply migration 029 to production Supabase (breed-images bucket + image_reviewed + newsletter_campaigns).
 * Run: npx railway run node scripts/apply-migration-029.js
 */

const fs = require("fs");
const path = require("path");
const { getSupabaseAdmin } = require("./_env");

async function main() {
  const sqlPath = path.join(__dirname, "../supabase/migrations/029_breed_images_bucket_and_newsletter.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  // Supabase JS cannot run arbitrary DDL — use REST SQL endpoint via service role
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    console.log("RPC not available — apply manually in Supabase SQL Editor:");
    console.log(sqlPath);
    console.log("\nOr run the SQL file contents in Dashboard → SQL Editor.");
    process.exit(0);
  }

  console.log("Migration 029 applied.");
}

main().catch((err) => {
  console.error(err.message);
  console.log("\nApply supabase/migrations/029_breed_images_bucket_and_newsletter.sql manually in Supabase SQL Editor.");
  process.exit(1);
});
