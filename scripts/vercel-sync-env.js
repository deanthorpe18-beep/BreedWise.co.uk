/**
 * Push .env.local keys to Vercel production (and preview) via CLI.
 * Does not print secret values.
 * Run: node scripts/vercel-sync-env.js
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getSupabaseAdmin } = require("./_env"); // loads .env.local via _env

// Required keys for production
const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_NOREPLY_EMAIL",
  "RESEND_ADMIN_EMAIL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "CRON_SECRET",
  "ADMIN_SETUP_SECRET",
  "ADMIN_SECRET_KEY",
  "ADMIN_SETUP_DISABLED",
  "GOOGLE_PLACES_API_ENABLED",
  "GOOGLE_PLACES_API_DISABLED",
  "GOOGLE_PLACES_API_KEY",
  "NEXT_PUBLIC_ADSENSE_ENABLED",
  "SITE_OFFLINE",
];

function vercelEnvAdd(key, value, env) {
  // Remove existing then add (idempotent-ish)
  try {
    execFileSync("npx", ["vercel", "env", "rm", key, env, "--yes"], {
      stdio: ["ignore", "ignore", "ignore"],
      shell: true,
    });
  } catch {
    // ignore if missing
  }

  execFileSync("npx", ["vercel", "env", "add", key, env], {
    input: value + "\n",
    stdio: ["pipe", "ignore", "pipe"],
    shell: true,
    encoding: "utf8",
  });
}

function main() {
  // Ensure ADMIN_SETUP_DISABLED is set for production even if missing locally
  if (!process.env.ADMIN_SETUP_DISABLED) {
    process.env.ADMIN_SETUP_DISABLED = "true";
  }

  const missing = [];
  for (const key of KEYS) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length) {
    console.error("Missing env keys in .env.local:", missing.join(", "));
  }

  const targets = ["production", "preview"];
  for (const env of targets) {
    console.log(`\nSyncing ${env}...`);
    for (const key of KEYS) {
      const value = process.env[key];
      if (!value) {
        console.log(`  skip ${key} (empty)`);
        continue;
      }
      try {
        vercelEnvAdd(key, value, env);
        console.log(`  ok ${key}`);
      } catch (err) {
        console.error(`  FAIL ${key}:`, err.stderr?.toString?.() || err.message);
      }
    }
  }
  console.log("\nDone.");
}

main();
