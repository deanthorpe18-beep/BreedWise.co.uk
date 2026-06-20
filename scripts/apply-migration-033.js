/**
 * Apply migration 033 (pup sale fields).
 * Run: node scripts/apply-migration-033.js
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { getSupabaseDatabaseUrl } = require("./_env");

async function main() {
  const dbUrl = getSupabaseDatabaseUrl();
  const sqlPath = path.join(__dirname, "../supabase/migrations/033_breeder_portal_sales.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  if (!dbUrl) {
    console.log("Could not build database URL — check .env.local has NEXT_PUBLIC_SUPABASE_URL and Supabase Password.");
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);

  const check = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'breeding_litter_animals'
      AND column_name IN ('buyer_name', 'deposit_received', 'insurance_policy_number', 'go_home_date')
    ORDER BY column_name
  `);
  await client.end();

  console.log("Migration 033 applied — sale columns ready:");
  check.rows.forEach((r) => console.log("  ✓", r.column_name));
}

main().catch((err) => {
  console.error(err.message);
  console.log("\nPaste supabase/migrations/033_breeder_portal_sales.sql into Supabase SQL Editor instead.");
  process.exit(1);
});
