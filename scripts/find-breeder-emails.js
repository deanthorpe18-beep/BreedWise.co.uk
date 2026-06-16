const { Client } = require("pg");

const client = new Client({
  connectionString:
    "postgresql://postgres:gjAGNF4F6QtcOrZk@db.zbvwqsjgasgxpphljahs.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

// Simple email regex (catches most common formats)
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Domains to skip (social media, no-contact sites)
const SKIP_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "youtube.com",
  "linkedin.com",
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
  // Filter out common false positives
  return matches
    .map((e) => e.toLowerCase())
    .filter((e) => {
      if (e.includes("example.com")) return false;
      if (e.includes("domain.com")) return false;
      if (e.includes("yourname")) return false;
      if (e.includes("info@") && e.endsWith(".jpg")) return false;
      if (e.startsWith("noreply@")) return false;
      if (e.startsWith("no-reply@")) return false;
      if (e.includes("@sentry.io")) return false;
      if (e.includes("@google.com")) return false;
      if (e.includes("@facebook.com")) return false;
      if (e.includes("@wix.com")) return false;
      if (e.includes("@squarespace.com")) return false;
      return true;
    });
}

async function findEmailForBreeder(website) {
  if (!website || shouldSkip(website)) return null;

  // Try homepage
  let html = await fetchText(website);
  let emails = extractEmails(html);
  if (emails.length > 0) return emails[0];

  // Try /contact
  const contactUrl = website.replace(/\/?$/, "/contact");
  html = await fetchText(contactUrl);
  emails = extractEmails(html);
  if (emails.length > 0) return emails[0];

  // Try /contact-us
  const contactUsUrl = website.replace(/\/?$/, "/contact-us");
  html = await fetchText(contactUsUrl);
  emails = extractEmails(html);
  if (emails.length > 0) return emails[0];

  return null;
}

async function run() {
  await client.connect();
  console.log("Connected. Searching for real breeder emails...\n");

  const { rows: breeders } = await client.query(
    `SELECT slug, name, website
     FROM breeders
     WHERE status = 'public_listing'
       AND claimed = false
       AND (email IS NULL OR email = '')
       AND website IS NOT NULL
     ORDER BY name`
  );

  console.log(`Found ${breeders.length} breeders with websites but no emails.\n`);

  let found = 0;
  let checked = 0;
  const updates = [];

  for (const breeder of breeders) {
    if (shouldSkip(breeder.website)) {
      console.log(`[SKIP] ${breeder.name} — social media link`);
      continue;
    }

    checked++;
    const email = await findEmailForBreeder(breeder.website);

    if (email) {
      console.log(`[FOUND] ${breeder.name} → ${email}`);
      updates.push({ slug: breeder.slug, email });
      found++;
    } else {
      console.log(`[NONE]  ${breeder.name}`);
    }

    // Polite delay
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n---`);
  console.log(`Checked: ${checked}`);
  console.log(`Found:   ${found}`);
  console.log(`\nUpdating database...`);

  for (const u of updates) {
    await client.query(`UPDATE breeders SET email = $1 WHERE slug = $2`, [
      u.email,
      u.slug,
    ]);
  }

  console.log(`Updated ${updates.length} breeders with real emails.`);
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
