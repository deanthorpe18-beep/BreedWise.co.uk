/**
 * Apply migration 039 (claim evidence types + registry verification badges).
 * Run: node scripts/apply-migration-039.js
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

  const sqlPath = path.join(__dirname, "../supabase/migrations/039_claim_evidence_and_registry_badges.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Applying migration 039...");
  await client.query(sql);
  console.log("Migration 039 applied.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
