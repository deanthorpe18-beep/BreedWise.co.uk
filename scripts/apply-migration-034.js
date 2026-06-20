/**
 * Apply migration 034 (receipt template settings).
 * Run: node scripts/apply-migration-034.js
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { getSupabaseDatabaseUrl } = require("./_env");

async function main() {
  const dbUrl = getSupabaseDatabaseUrl();
  const sqlPath = path.join(__dirname, "../supabase/migrations/034_breeder_receipt_templates.sql");
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
      AND (
        (table_name = 'breeders' AND column_name = 'receipt_settings')
        OR (table_name = 'breeding_litter_animals' AND column_name = 'receipt_drafts')
      )
    ORDER BY table_name, column_name
  `);
  await client.end();

  console.log("Migration 034 applied — receipt template columns ready:");
  check.rows.forEach((r) => console.log("  ✓", r.column_name));
}

main().catch((err) => {
  console.error(err.message);
  console.log("\nPaste supabase/migrations/034_breeder_receipt_templates.sql into Supabase SQL Editor instead.");
  process.exit(1);
});
