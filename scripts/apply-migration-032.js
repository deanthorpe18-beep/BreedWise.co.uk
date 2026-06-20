/**
 * Apply migration 032 (breeder portal tables).
 * Run: railway run node scripts/apply-migration-032.js
 * Or paste supabase/migrations/032_breeder_portal.sql into Supabase SQL Editor.
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("./_env");

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  const sqlPath = path.join(__dirname, "../supabase/migrations/032_breeder_portal.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  if (!dbUrl) {
    console.log("No DATABASE_URL — apply manually in Supabase → SQL Editor:");
    console.log(sqlPath);
    process.exit(0);
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("Migration 032 applied — breeding portal tables ready.");
}

main().catch((err) => {
  console.error(err.message);
  console.log("\nPaste supabase/migrations/032_breeder_portal.sql into Supabase SQL Editor instead.");
  process.exit(1);
});
