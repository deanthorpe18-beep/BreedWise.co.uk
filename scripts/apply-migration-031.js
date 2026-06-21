/**
 * Apply migration 031 (licence verification columns + saved search animal + share CTA).
 * Run: node scripts/apply-migration-031.js
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { getSupabaseDatabaseUrl } = require("./_env");

async function main() {
  const url = getSupabaseDatabaseUrl();
  if (!url) {
    console.error("Missing DATABASE_URL / SUPABASE_DB_PASSWORD in .env.local");
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, "../supabase/migrations/031_licence_verification_and_alerts.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Applying migration 031...");
  await client.query(sql);
  console.log("Migration 031 applied.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
