/**
 * Scrape contact emails from breeder websites and update breeders.email.
 *
 * Usage:
 *   node scripts/find-breeder-emails.js
 *   node scripts/find-breeder-emails.js --limit=100
 *   node scripts/find-breeder-emails.js --refresh-invalid
 */

require("./_env");

const { getSupabaseAdmin } = require("./_env");
const { isValidBreederEmail, normalizeBreederEmail } = require("./email-utils");

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const SKIP_DOMAINS = [
  "facebook.com", "instagram.com", "twitter.com", "x.com",
  "tiktok.com", "youtube.com", "linkedin.com",
];

function shouldSkip(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SKIP_DOMAINS.some((d) => hostname.includes(d));
  } catch {
    return true;
  }
}

async function fetchText(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BreedWise/1.0; +https://breedwise.co.uk)",
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

function extractEmails(html) {
  if (!html) return [];
  const matches = html.match(EMAIL_REGEX) || [];
  return [...new Set(
    matches
      .map((e) => e.replace(/(phone|tel|fax|email|mail)$/i, ""))
      .map((e) => normalizeBreederEmail(e))
      .filter(Boolean)
  )];
}

async function findEmailForWebsite(website) {
  if (!website || shouldSkip(website)) return null;

  const base = website.replace(/\/$/, "");
  const paths = ["", "/contact", "/contact-us", "/about", "/about-us"];

  for (const path of paths) {
    const html = await fetchText(`${base}${path}`);
    const emails = extractEmails(html);
    if (emails.length > 0) return emails[0];
  }

  return null;
}

async function loadAllWithEmail(supabase) {
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("breeders")
      .select("id, slug, name, email, website")
      .neq("status", "archived")
      .not("email", "is", null)
      .neq("email", "")
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return all;
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith("--limit="))?.split("=")[1];
  const limit = args.includes("--all")
    ? 10000
    : parseInt(limitArg || "150", 10);
  const refreshInvalid = args.includes("--refresh-invalid");
  const dryRun = args.includes("--dry-run");
  const newestFirst = args.includes("--newest") || limit > 500;

  const supabase = getSupabaseAdmin();

  console.log("=== Breeder email discovery ===\n");

  // Step 1: Clear junk emails already stored
  const withEmail = await loadAllWithEmail(supabase);
  const invalid = withEmail.filter((b) => !isValidBreederEmail(b.email));
  console.log(`Invalid emails to clear: ${invalid.length}`);

  if (!dryRun && invalid.length > 0) {
    for (const b of invalid) {
      await supabase.from("breeders").update({ email: null }).eq("id", b.id);
    }
    console.log(`Cleared ${invalid.length} invalid email(s)\n`);
  }

  // Step 2: Re-scrape breeders with invalid email that have a website
  if (refreshInvalid) {
    const toRefresh = invalid.filter((b) => b.website);
    console.log(`Re-scraping ${Math.min(toRefresh.length, limit)} previously invalid…\n`);
    let refreshed = 0;
    for (const b of toRefresh.slice(0, limit)) {
      const email = await findEmailForWebsite(b.website);
      if (email) {
        console.log(`[FIX] ${b.name} → ${email}`);
        if (!dryRun) await supabase.from("breeders").update({ email }).eq("id", b.id);
        refreshed++;
      } else {
        console.log(`[NONE] ${b.name}`);
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    console.log(`\nRefreshed: ${refreshed}`);
  }

  // Step 3: Find emails for unclaimed listings with website but no email
  let candidates = [];
  let from = 0;
  while (candidates.length < limit) {
    const { data, error } = await supabase
      .from("breeders")
      .select("id, slug, name, website")
      .eq("status", "public_listing")
      .eq("claimed", false)
      .not("website", "is", null)
      .neq("website", "")
      .or("email.is.null,email.eq.")
      .order(newestFirst ? "created_at" : "name", { ascending: newestFirst ? false : true })
      .range(from, from + 199);

    if (error) throw error;
    if (!data?.length) break;
    candidates = candidates.concat(data.filter((b) => !shouldSkip(b.website)));
    if (data.length < 200) break;
    from += 200;
  }

  candidates = candidates.slice(0, limit);
  console.log(`\nScraping ${candidates.length} breeders with website but no email…\n`);

  let found = 0;
  for (const b of candidates) {
    const email = await findEmailForWebsite(b.website);
    if (email) {
      console.log(`[FOUND] ${b.name} → ${email}`);
      if (!dryRun) await supabase.from("breeders").update({ email }).eq("id", b.id);
      found++;
    } else {
      console.log(`[NONE]  ${b.name}`);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  const { count: outreachReady } = await supabase
    .from("breeders")
    .select("*", { count: "exact", head: true })
    .eq("status", "public_listing")
    .eq("claimed", false)
    .not("email", "is", null)
    .neq("email", "");

  console.log("\n=== Summary ===");
  console.log(`New emails found:     ${found}`);
  console.log(`Outreach-ready rows:  ${outreachReady} (before validation filter in admin)`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
