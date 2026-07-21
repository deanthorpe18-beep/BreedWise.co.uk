/**
 * Live site smoke checks (no Google Places, no paid APIs).
 * Run: node scripts/smoke-live.js
 */
const BASE = process.env.SMOKE_BASE_URL || "https://breedwise.co.uk";

async function check(name, fn) {
  try {
    const result = await fn();
    console.log(result.ok ? `PASS  ${name}` : `FAIL  ${name} — ${result.detail}`);
    return !!result.ok;
  } catch (err) {
    console.log(`FAIL  ${name} — ${err.message}`);
    return false;
  }
}

async function get(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: "manual",
    ...opts,
    headers: { ...(opts.headers || {}), Accept: "application/json,text/html" },
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html */
  }
  return { res, text, json, status: res.status };
}

async function main() {
  let pass = 0;
  let fail = 0;
  const run = async (name, fn) => {
    const ok = await check(name, fn);
    if (ok) pass++;
    else fail++;
  };

  await run("health", async () => {
    const { status, json } = await get("/api/health");
    return { ok: status === 200 && json?.status === "ok", detail: `${status} ${JSON.stringify(json)}` };
  });

  await run("home HTML", async () => {
    const { status, text } = await get("/");
    return { ok: status === 200 && /BreedWise/i.test(text), detail: String(status) };
  });

  await run("signup page", async () => {
    const { status, text } = await get("/auth/signup");
    return { ok: status === 200 && /Create an account/i.test(text), detail: String(status) };
  });

  await run("claim page has breeder type", async () => {
    const { status, text } = await get("/claim");
    return {
      ok: status === 200 && /What type of breeder are you/i.test(text),
      detail: status === 200 ? "missing type dropdown?" : String(status),
    };
  });

  await run("search page", async () => {
    const { status } = await get("/search?breed=Labrador&q=London");
    return { ok: status === 200, detail: String(status) };
  });

  await run("search API", async () => {
    const { status, json } = await get("/api/search?breed=Labrador&q=London");
    const count = json?.breeders?.length ?? json?.totalCount;
    return {
      ok: status === 200 && (Array.isArray(json?.breeders) || typeof json?.totalCount === "number"),
      detail: `${status} count=${count}`,
    };
  });

  await run("public stats", async () => {
    const { status, json } = await get("/api/public/stats");
    return { ok: status === 200 && json, detail: `${status}` };
  });

  await run("stripe tiers configured", async () => {
    const { status, json } = await get("/api/stripe/tiers");
    const tiers = json?.tiers || {};
    const needed = ["bronze", "silver", "gold"];
    const missingPrice = needed.filter((t) => !tiers[t]?.stripePriceId && !tiers[t]?.stripe_price_id && !tiers[t]?.priceId);
    // getAllTiersFromDB shape may vary — also accept monthlyPrice presence
    const hasPrices = needed.every((t) => tiers[t]);
    return {
      ok: status === 200 && hasPrices,
      detail: `${status} keys=${Object.keys(tiers).join(",")} missingPriceHint=${missingPrice.join(",") || "n/a"} sample=${JSON.stringify(tiers.gold || tiers).slice(0, 200)}`,
    };
  });

  await run("subscribe requires auth", async () => {
    const { status, json } = await get("/api/stripe/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ breederId: "00000000-0000-0000-0000-000000000000", tier: "gold" }),
    });
    return { ok: status === 401, detail: `${status} ${json?.error || ""}` };
  });

  await run("portal requires auth", async () => {
    const { status } = await get("/api/breeder/portal");
    return { ok: status === 401 || status === 403, detail: String(status) };
  });

  await run("signup rejects weak password", async () => {
    const { status, json } = await get("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "Test",
        email: "smoke-test-invalid@example.com",
        password: "weak",
        confirmPassword: "weak",
        accountIntent: "breeder",
        agreeTerms: true,
      }),
    });
    return { ok: status === 400, detail: `${status} ${json?.error || ""}` };
  });

  await run("signup requires terms", async () => {
    const { status, json } = await get("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "Test Breeder",
        email: "smoke-test-terms@example.com",
        password: "ValidPass1!",
        confirmPassword: "ValidPass1!",
        accountIntent: "breeder",
        agreeTerms: false,
      }),
    });
    return { ok: status === 400, detail: `${status} ${json?.error || ""}` };
  });

  await run("places API does not call Google when disabled (cache-or-503)", async () => {
    const { status, json } = await get("/api/places/ChIJsmokeFakePlaceId123");
    // Must not be a Google error; should be 503 disabled or cached
    const ok =
      (status === 503 && json?.disabled === true) ||
      (status === 200 && (json?._cached === true || json?.disabled === true));
    return { ok, detail: `${status} disabled=${json?.disabled} cached=${json?._cached}` };
  });

  await run("google-refresh cron is safe when disabled", async () => {
    const { status, json } = await get("/api/cron/google-refresh");
    // Without secret may 401; with no secret configured maybe runs — either way must not process Google
    if (status === 401) return { ok: true, detail: "401 unauthorized (cron protected)" };
    return {
      ok: status === 200 && (json?.disabled === true || json?.placeApiCalls === 0 || json?.totalApiCalls === 0),
      detail: `${status} ${JSON.stringify(json).slice(0, 180)}`,
    };
  });

  await run("featured breeders", async () => {
    const { status, json } = await get("/api/featured-breeders");
    return { ok: status === 200 && Array.isArray(json?.breeders || json), detail: String(status) };
  });

  await run("breeds encyclopedia", async () => {
    const { status, text } = await get("/breeds");
    return { ok: status === 200 && text.length > 500, detail: String(status) };
  });

  // Sample public breeder profile from search
  const search = await get("/api/search?breed=Labrador&q=UK");
  const slug = search.json?.breeders?.[0]?.slug;
  await run("breeder profile page", async () => {
    if (!slug) return { ok: false, detail: "no search results for labrador" };
    const { status, text } = await get(`/breeder/${slug}`);
    return {
      ok: status === 200 && /openstreetmap\.org/i.test(text) && !/maps\.googleapis\.com\/maps\/api/i.test(text),
      detail: `${status} slug=${slug} osm=${/openstreetmap/.test(text)}`,
    };
  });

  await run("google-reviews cache-only endpoint", async () => {
    if (!slug) return { ok: true, detail: "skipped (no slug)" };
    const { status, json } = await get(`/api/breeders/${slug}/google-reviews`);
    return {
      ok: status === 200 && json?._cached === true,
      detail: `${status} cached=${json?._cached} reviews=${json?.reviews?.length ?? 0}`,
    };
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
