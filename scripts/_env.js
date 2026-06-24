const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnvFile(filename) {
  const filePath = path.join(__dirname, "..", filename);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    console.error("Set it in .env.local or export before running scripts.");
    console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_PLACES_API_KEY");
    process.exit(1);
  }
  return value;
}

function getSupabaseAdmin() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function getGooglePlacesApiKey() {
  if (
    process.env.GOOGLE_PLACES_API_DISABLED === "true" ||
    process.env.GOOGLE_PLACES_API_DISABLED === "1" ||
    (process.env.GOOGLE_PLACES_API_ENABLED !== "true" && process.env.GOOGLE_PLACES_API_ENABLED !== "1")
  ) {
    console.error("Google Places API is disabled. Set GOOGLE_PLACES_API_ENABLED=true in .env.local to run Google scripts.");
    process.exit(1);
  }
  return requireEnv("GOOGLE_PLACES_API_KEY");
}

function getSupabaseDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let password = process.env.SUPABASE_DB_PASSWORD;

  if (!password) {
    const envPath = path.join(__dirname, "..", ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/Supabase Password\s*[-–]\s*(\S+)/i);
      if (match) password = match[1].trim();
    }
  }

  if (!supabaseUrl || !password) return null;

  const ref = supabaseUrl.replace(/^https?:\/\//, "").replace(/\.supabase\.co\/?$/, "").trim();
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

module.exports = { requireEnv, getSupabaseAdmin, getGooglePlacesApiKey, getSupabaseDatabaseUrl };
