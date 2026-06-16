const { Client } = require("pg");

const client = new Client({
  connectionString:
    "postgresql://postgres:gjAGNF4F6QtcOrZk@db.zbvwqsjgasgxpphljahs.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SKIP_DOMAINS = ["facebook.com", "instagram.com", "twitter.com", "x.com", "tiktok.com", "youtube.com", "linkedin.com"];
const SKIP_EMAILS = ["example@mysite.com", "your@email.com", "your@email.co.uk", "info@ndiscovered.com", "impallari@gmail.com", "eben@eyebytes.com", "micah@micahrich.com", "support@webador.com", "contact@sansoxygen.com", "developers@kal-group.com", "hello@northernmediauk.com", "logo_250x@2x.png", "cropped_logo_250x@2x.png", "assured%20breeders%202@2x.jpeg", "asset-8@4x.png", "hound@2x.png", "user@domain.com", "emailinfo@dedidedly.co.uk"];

function shouldSkip(url) {
  try { return SKIP_DOMAINS.some((d) => new URL(url).hostname.toLowerCase().includes(d)); } catch { return true; }
}

function isValidEmail(email) {
  if (!email || !email.includes("@")) return false;
  const lower = email.toLowerCase();
  if (SKIP_EMAILS.includes(lower)) return false;
  if (lower.includes("example@")) return false;
  if (lower.includes("your@")) return false;
  if (lower.includes("sentry")) return false;
  if (lower.includes("wixpress")) return false;
  if (lower.includes("wix.com")) return false;
  if (lower.includes("squarespace")) return false;
  if (lower.includes("shopify")) return false;
  if (lower.includes("wordpress")) return false;
  if (lower.includes("webador")) return false;
  if (lower.includes("@2x.png") || lower.includes("@4x.png") || lower.includes(".jpeg") || lower.includes(".jpg") || lower.includes(".png")) return false;
  return true;
}

async function fetchText(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch { clearTimeout(timer); return null; }
}

function extractEmails(html) {
  if (!html) return [];
  return (html.match(EMAIL_REGEX) || []).map((e) => e.toLowerCase()).filter(isValidEmail);
}

async function findEmailForBreeder(website) {
  if (!website || shouldSkip(website)) return null;
  let emails = extractEmails(await fetchText(website));
  if (emails.length > 0) return emails[0];
  emails = extractEmails(await fetchText(website.replace(/\/?$/, "/contact")));
  if (emails.length > 0) return emails[0];
  emails = extractEmails(await fetchText(website.replace(/\/?$/, "/contact-us")));
  if (emails.length > 0) return emails[0];
  return null;
}

async function run() {
  await client.connect();
  const limit = parseInt(process.argv[2] || "100", 10);
  const offset = parseInt(process.argv[3] || "0", 10);

  const { rows: breeders } = await client.query(
    `SELECT slug, name, website FROM breeders
     WHERE status = 'public_listing' AND claimed = false
       AND (email IS NULL OR email = '') AND website IS NOT NULL
     ORDER BY name LIMIT $1 OFFSET $2`, [limit, offset]
  );

  console.log(`Processing ${breeders.length} breeders (batch limit: ${limit})...\n`);
  let found = 0;

  for (const breeder of breeders) {
    if (shouldSkip(breeder.website)) { console.log(`[SKIP] ${breeder.name}`); continue; }
    const email = await findEmailForBreeder(breeder.website);
    if (email) {
      console.log(`[FOUND] ${breeder.name} → ${email}`);
      await client.query(`UPDATE breeders SET email = $1 WHERE slug = $2`, [email, breeder.slug]);
      found++;
    } else {
      console.log(`[NONE]  ${breeder.name}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\nBatch done. Found and saved: ${found}`);
  const { rows: total } = await client.query(`SELECT COUNT(*) FROM breeders WHERE status = 'public_listing' AND claimed = false AND email IS NOT NULL AND email != ''`);
  console.log(`Total breeders with emails now: ${total[0].count}`);
  await client.end();
}

run().catch((err) => { console.error(err); process.exit(1); });
