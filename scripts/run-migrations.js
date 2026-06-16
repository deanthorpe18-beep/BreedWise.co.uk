const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const client = new Client({
  connectionString:
    "postgresql://postgres:gjAGNF4F6QtcOrZk@db.zbvwqsjgasgxpphljahs.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log("Connected to Supabase.\n");

  const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Running ${file} ...`);
    try {
      await client.query(sql);
      console.log(`  ✅ ${file} OK`);
    } catch (err) {
      console.error(`  ❌ ${file} FAILED:`, err.message);
    }
  }

  await client.end();
  console.log("\nDone.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
