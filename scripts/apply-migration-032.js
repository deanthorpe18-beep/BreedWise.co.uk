/**
 * Apply migration 032 (breeder portal tables).
 * Run: railway run node scripts/apply-migration-032.js
 * Or paste supabase/migrations/032_breeder_portal.sql into Supabase SQL Editor.
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { getSupabaseDatabaseUrl } = require("./_env");

async function main() {
  const dbUrl = getSupabaseDatabaseUrl();
  const sqlPath = path.join(__dirname, "../supabase/migrations/032_breeder_portal.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  if (!dbUrl) {
    console.log("Could not build database URL — check .env.local has NEXT_PUBLIC_SUPABASE_URL and Supabase Password.");
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);

  const check = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('breeding_animals', 'breeding_litters', 'breeding_litter_animals')
    ORDER BY table_name
  `);
  await client.end();

  console.log("Migration 032 applied — breeding portal tables ready:");
  check.rows.forEach((r) => console.log("  ✓", r.table_name));
}

main().catch((err) => {
  console.error(err.message);
  console.log("\nPaste supabase/migrations/032_breeder_portal.sql into Supabase SQL Editor instead.");
  process.exit(1);
});
