/**
 * Apply migration 035 (waitlist + public litter announcements).
 * Run: node scripts/apply-migration-035.js
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { getSupabaseDatabaseUrl } = require("./_env");

async function main() {
  const dbUrl = getSupabaseDatabaseUrl();
  const sqlPath = path.join(__dirname, "../supabase/migrations/035_waitlist_and_litter_announcements.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  if (!dbUrl) {
    console.log("Could not build database URL — check .env.local.");
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);

  const check = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'breeder_waitlist'
  `);
  await client.end();

  console.log("Migration 035 applied:");
  check.rows.forEach((r) => console.log("  ✓", r.table_name));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
