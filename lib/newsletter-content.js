/** Auto-generated newsletter content — rich light editorial layout */

const SITE = "https://breedwise.co.uk";
const EDITORIAL = {
  accent: "#00BFA5",
  accentSoft: "#E6FFFB",
  accentMuted: "#B2F5EA",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  heading: "#0F172A",
  body: "#475569",
  muted: "#94A3B8",
  border: "#E2E8F0",
  serif: "Georgia, 'Times New Roman', Times, serif",
  sans: "Inter, 'Segoe UI', Helvetica, Arial, sans-serif",
};

function emailLogoBlock() {
  return `<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 16px;">
    <tr><td align="center" style="background:${EDITORIAL.accentSoft};border:1px solid ${EDITORIAL.accentMuted};border-radius:9999px;padding:8px 20px;">
      <span style="font-family:${EDITORIAL.sans};font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${EDITORIAL.accent};">BreedWise</span>
    </td></tr>
    <tr><td align="center" style="padding-top:14px;">
      <span style="font-family:${EDITORIAL.serif};font-size:26px;font-weight:400;color:${EDITORIAL.heading};letter-spacing:-0.02em;">breedwise.co.uk</span>
    </td></tr>
  </table>`;
}

function sectionLabel(text, color = EDITORIAL.accent) {
  return `<p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${color};font-family:${EDITORIAL.sans};">${text}</p>`;
}

function sectionDivider(accent = EDITORIAL.accent) {
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0 24px;"><tr>
    <td style="width:48px;height:3px;background:${accent};border-radius:2px;"></td>
    <td style="border-bottom:1px solid ${EDITORIAL.border};"></td>
  </tr></table>`;
}

export const NEWSLETTER_TOPICS = [
  { id: "weekly", label: "Weekly roundup", desc: "Stats, trending breeds & site news", color: "#00BFA5", icon: "📬" },
  { id: "buyer-tips", label: "Buyer safety guide", desc: "Red flags, questions & viewing tips", color: "#FF6B6B", icon: "🛡️" },
  { id: "breed-spotlight", label: "Breed spotlight", desc: "Deep dive on one breed with photo", color: "#9333ea", icon: "🐾" },
  { id: "featured-breeders", label: "Featured breeders", desc: "Gold members with profile photos", color: "#FFB545", icon: "⭐" },
  { id: "new-listings", label: "New listings", desc: "Fresh breeders added this week", color: "#0ea5e9", icon: "✨" },
  { id: "multi-pet", label: "Beyond dogs", desc: "Cats, birds, reptiles & small pets", color: "#ec4899", icon: "🦜" },
  { id: "seasonal", label: "Seasonal tips", desc: "Timely advice for the time of year", color: "#059669", icon: "🌿" },
  { id: "breeder-promo", label: "For breeders", desc: "Claim profile & upgrade benefits", color: "#f97316", icon: "🏠" },
  { id: "compare-tool", label: "Compare breeders", desc: "Promote the compare feature", color: "#6366f1", icon: "⚖️" },
  { id: "location-picks", label: "Location picks", desc: "Popular towns & regional search", color: "#14b8a6", icon: "📍" },
  { id: "education", label: "Education deep-dive", desc: "Guides, checklists & contracts", color: "#8b5cf6", icon: "📚" },
  { id: "surprise", label: "Surprise me", desc: "Random template each time", color: "#64748b", icon: "🎲" },
];

const BUYER_TIPS = [
  { title: "Always visit in person", body: "Never buy a pet without meeting the breeder and seeing the mum with her litter. A video call isn't enough — your future companion deserves a proper hello.", link: "/education/red-flags", color: "#FF6B6B", emoji: "🏠" },
  { title: "Ask about health testing", body: "Good breeders health-test parent animals for breed-specific conditions. Ask to see certificates — don't just take their word for it.", link: "/education/health-testing", color: "#00BFA5", emoji: "💚" },
  { title: "Check the council licence", body: "UK breeders producing 3+ litters a year need a council breeding licence. Ask for the number and verify it — it takes two minutes and could save you heartache.", link: "/education/what-to-ask", color: "#0ea5e9", emoji: "📋" },
  { title: "Use our viewing checklist", body: "Print our puppy viewing checklist and take it with you. It covers environment, paperwork, and warning signs — so you don't forget anything in the excitement.", link: "/guides/puppy-viewing-checklist", color: "#FFB545", emoji: "✅" },
  { title: "Compare before you commit", body: "Save up to 3 breeders on BreedWise and compare them side by side — location, reviews, licences, and health info. No rush, no pressure.", link: "/account/compare", color: "#6366f1", emoji: "⚖️" },
  { title: "Watch for red flags", body: "Multiple breeds always available, pressure to pay quickly, no mum present, or meeting in a car park — trust your gut and walk away.", link: "/education/red-flags", color: "#dc2626", emoji: "🚩" },
];

const EDUCATION_GUIDES = [
  {
    title: "How to compare breeders",
    body: "Learn what to look for when comparing listings — licences, reviews, health tests, and transparency.",
    extended: "Choosing a breeder is one of the biggest decisions you'll make as a pet owner. On BreedWise you can shortlist up to three breeders and compare them side by side — council licence status, Kennel Club registration, health testing, Google reviews, and location. Take your time. A responsible breeder will never rush you.",
    bullets: ["Save breeders with the heart icon on any listing", "Open Compare from your account menu", "Check licence numbers and health test certificates", "Read Google reviews and look for consistent feedback", "Contact only when you feel confident"],
    link: "/education/how-to-compare",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    cta: "Open the compare tool",
  },
  {
    title: "Puppy contract essentials",
    body: "A written contract protects you and the breeder. Know what should be included before you sign.",
    extended: "A proper puppy or pet contract should cover health guarantees, vaccination records, microchip details, return policy, and what happens if the pet develops a genetic condition. Never hand over money without a signed agreement — and always read it carefully before collection day.",
    bullets: ["Health guarantee period and what's covered", "Vaccination and worming schedule", "Microchip registration in your name", "Return or rehoming policy if things don't work out", "Parent health test results referenced in writing"],
    link: "/guides/puppy-contract-guide",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
    cta: "Read the contract guide",
  },
  {
    title: "Finding a reputable breeder",
    body: "Step-by-step guide to searching, shortlisting, and contacting breeders safely.",
    extended: "Start with breed research in our encyclopedia, then search by location on BreedWise. Look for claimed profiles with photos, detailed about sections, and verifiable council licences. Message through the platform so you have a record of what was agreed.",
    bullets: ["Research the breed in our encyclopedia first", "Filter by location, animal type, and breed", "Prioritise claimed profiles with full details", "Ask about mum, health tests, and socialisation", "Visit in person before paying a deposit"],
    link: "/guides/find-reputable-breeder",
    image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
    cta: "Start your search",
  },
  {
    title: "Transporting your new pet",
    body: "Planning the journey home? Tips for a safe, stress-free trip with your new companion.",
    extended: "Collection day is exciting — but travel can be stressful for a young animal. Plan the route, bring a secure carrier, pack water and wipes, and avoid long stops. Ask the breeder what the pet has been fed and when, so you can maintain routine on the journey home.",
    bullets: ["Use a secure, well-ventilated carrier or crate", "Bring water, wipes, and a familiar blanket if offered", "Keep journeys short — avoid hot cars entirely", "Ask the breeder about feeding times and diet", "Schedule a vet check within the first week"],
    link: "/guides/transporting-your-puppy",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80",
    cta: "Read the transport guide",
  },
];

const QUICK_LINKS = [
  { label: "Search breeders", url: "/search", color: "#00BFA5" },
  { label: "Breed encyclopedia", url: "/breeds", color: "#9333ea" },
  { label: "Buyer guides", url: "/education", color: "#8b5cf6" },
  { label: "Free checklist", url: "/tools/breeder-checklist", color: "#6366f1" },
];

const ANIMAL_FALLBACK_IMAGES = {
  dog: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
  cat: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=80",
  bird: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80",
  fish: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80",
  reptile: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80",
  "small-pet": "https://images.unsplash.com/photo-1425086631101-9c6b5e59ec8b?w=800&q=80",
  default: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickByDay(arr) {
  const day = Math.floor(Date.now() / 86400000);
  return arr[day % arr.length];
}

function season() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

function btn(url, label, bg = EDITORIAL.accent, outline = false) {
  if (outline) {
    return `<td style="padding-right:10px;">
      <a href="${url}" style="display:inline-block;padding:12px 24px;border:2px solid ${bg};border-radius:9999px;color:${bg};font-weight:600;font-size:14px;text-decoration:none;font-family:${EDITORIAL.sans};">${label}</a>
    </td>`;
  }
  return `<td style="padding-right:10px;">
    <a href="${url}" style="display:inline-block;padding:13px 28px;background:${bg};border-radius:9999px;color:#FFFFFF;font-weight:600;font-size:14px;text-decoration:none;font-family:${EDITORIAL.sans};">${label} →</a>
  </td>`;
}

function btnRow(primary, secondary) {
  return `<table cellpadding="0" cellspacing="0" style="margin:22px 0 0;"><tr>
    ${btn(`${SITE}${primary.url}`, primary.label, primary.color || EDITORIAL.accent)}
    ${secondary ? btn(`${SITE}${secondary.url}`, secondary.label, secondary.color || EDITORIAL.muted, true) : ""}
  </tr></table>`;
}

function statStrip(stats, accent = EDITORIAL.accent) {
  const cells = stats.map((s, i) => `<td width="33%" align="center" style="padding:${i === 1 ? "0 8px" : "0"};">
    <table cellpadding="0" cellspacing="0" width="100%" style="background:${EDITORIAL.surface};border:1px solid ${EDITORIAL.border};border-radius:14px;">
      <tr><td align="center" style="padding:18px 12px;">
        <p style="margin:0;font-size:26px;font-weight:700;color:${accent};font-family:${EDITORIAL.sans};line-height:1;">${s.value}</p>
        <p style="margin:8px 0 0;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${EDITORIAL.muted};font-family:${EDITORIAL.sans};">${s.label}</p>
      </td></tr>
    </table>
  </td>`).join("");
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;"><tr>${cells}</tr></table>`;
}

function introBlock(text) {
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;"><tr><td style="padding:0 4px;">
    <p style="margin:0;font-size:17px;color:${EDITORIAL.heading};line-height:1.7;font-family:${EDITORIAL.serif};font-weight:400;">${text}</p>
  </td></tr></table>`;
}

function bulletList(items, color = EDITORIAL.accent) {
  const rows = items.map((item) => `<tr><td style="padding:8px 0;vertical-align:top;width:28px;">
    <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:${EDITORIAL.accentSoft};color:${color};border-radius:50%;font-size:12px;font-weight:700;font-family:${EDITORIAL.sans};">✓</span>
  </td><td style="padding:8px 0 8px 4px;color:${EDITORIAL.body};font-size:15px;line-height:1.6;font-family:${EDITORIAL.sans};">${item}</td></tr>`).join("");
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0 0;">${rows}</table>`;
}

function card(heading, body, opts = {}) {
  const { color = EDITORIAL.accent, link, secondaryLink, image, imageAlt, bullets, skipImage } = opts;
  const showImage = image && !skipImage;
  const imgBlock = showImage
    ? `<img src="${image}" alt="${imageAlt || heading}" width="544" style="display:block;width:100%;max-width:544px;height:200px;object-fit:cover;margin:0;" />`
    : "";
  const bulletsBlock = bullets?.length ? bulletList(bullets, color) : "";
  const linkBlock = link || secondaryLink
    ? btnRow(
        link || secondaryLink,
        link && secondaryLink ? secondaryLink : null
      )
    : "";
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:22px;border:1px solid ${EDITORIAL.border};border-radius:16px;overflow:hidden;background:${EDITORIAL.surface};box-shadow:0 1px 3px rgba(15,23,42,0.06);">
    ${showImage ? `<tr><td style="padding:0;line-height:0;">${imgBlock}</td></tr>` : ""}
    <tr><td style="padding:0;">
      <table cellpadding="0" cellspacing="0" width="100%"><tr>
        <td style="width:5px;background:${color};"></td>
        <td style="padding:24px 26px 26px;background:${EDITORIAL.surface};">
          <h3 style="margin:0 0 10px;font-size:21px;color:${EDITORIAL.heading};font-family:${EDITORIAL.serif};font-weight:400;line-height:1.35;">${heading}</h3>
          <p style="margin:0;color:${EDITORIAL.body};line-height:1.75;font-size:15px;font-family:${EDITORIAL.sans};">${body}</p>
          ${bulletsBlock}
          ${linkBlock}
        </td>
      </tr></table>
    </td></tr>
  </table>`;
}

function tipBox(title, body, color = EDITORIAL.accent, link) {
  const linkBlock = link ? btnRow(link) : "";
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:22px;"><tr><td style="background:${EDITORIAL.accentSoft};border:1px solid ${EDITORIAL.accentMuted};border-left:4px solid ${color};border-radius:14px;padding:24px 26px;">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${color};font-family:${EDITORIAL.sans};">💡 Good to know</p>
    <p style="margin:0 0 10px;font-size:19px;font-weight:400;color:${EDITORIAL.heading};font-family:${EDITORIAL.serif};line-height:1.35;">${title}</p>
    <p style="margin:0;color:${EDITORIAL.body};line-height:1.75;font-size:15px;font-family:${EDITORIAL.sans};">${body}</p>
    ${linkBlock}
  </td></tr></table>`;
}

function ctaBanner(title, body, primary, accent = EDITORIAL.accent) {
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0 22px;border-radius:16px;overflow:hidden;">
    <tr><td style="background:linear-gradient(135deg, ${accent} 0%, ${accent}dd 100%);padding:32px 28px;text-align:center;">
      <p style="margin:0 0 8px;font-size:22px;font-weight:400;color:#FFFFFF;font-family:${EDITORIAL.serif};line-height:1.3;">${title}</p>
      <p style="margin:0 auto;max-width:420px;font-size:15px;color:rgba(255,255,255,0.92);line-height:1.65;font-family:${EDITORIAL.sans};">${body}</p>
      <table cellpadding="0" cellspacing="0" align="center" style="margin:20px auto 0;"><tr>
        <td style="background:#FFFFFF;border-radius:9999px;">
          <a href="${SITE}${primary.url}" style="display:inline-block;padding:14px 32px;color:${accent};font-weight:700;font-size:14px;text-decoration:none;font-family:${EDITORIAL.sans};">${primary.label} →</a>
        </td>
      </tr></table>
    </td></tr>
  </table>`;
}

function quickLinksRow(links = QUICK_LINKS) {
  const half = Math.ceil(links.length / 2);
  const row1 = links.slice(0, half);
  const row2 = links.slice(half);
  const cell = (l) => `<td width="50%" style="padding:6px;">
    <a href="${SITE}${l.url}" style="display:block;padding:14px 16px;background:${EDITORIAL.surface};border:1px solid ${EDITORIAL.border};border-radius:12px;text-decoration:none;">
      <span style="font-size:13px;font-weight:700;color:${l.color};font-family:${EDITORIAL.sans};">${l.label} →</span>
    </a>
  </td>`;
  const row = (items) => `<tr>${items.map(cell).join("")}${items.length === 1 ? '<td width="50%"></td>' : ""}</tr>`;
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:22px;">
    <tr><td style="padding:0 4px 12px;">${sectionLabel("Explore BreedWise", EDITORIAL.muted)}</td></tr>
    <tr><td>
      <table cellpadding="0" cellspacing="0" width="100%">${row(row1)}${row2.length ? row(row2) : ""}</table>
    </td></tr>
  </table>`;
}

function miniGuideCards(guides, accentColor) {
  return guides.map((g) => card(g.title, g.body, {
    color: accentColor,
    skipImage: true,
    link: { url: g.link, label: "Read guide", color: accentColor },
  })).join("");
}

function breederCard(breeder) {
  const img = breeder.hero_image_url || ANIMAL_FALLBACK_IMAGES.default;
  const loc = [breeder.town, breeder.county].filter(Boolean).join(", ");
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:18px;border:1px solid ${EDITORIAL.border};border-radius:16px;overflow:hidden;background:${EDITORIAL.surface};">
    <tr><td style="padding:0;line-height:0;"><img src="${img}" alt="${breeder.name}" width="544" style="display:block;width:100%;height:180px;object-fit:cover;" /></td></tr>
    <tr><td style="padding:20px 24px;background:${EDITORIAL.surface};">
      <p style="margin:0;font-size:18px;font-weight:400;color:${EDITORIAL.heading};font-family:${EDITORIAL.serif};">${breeder.name}</p>
      <p style="margin:6px 0 0;font-size:13px;color:${EDITORIAL.muted};font-family:${EDITORIAL.sans};">${loc}</p>
      ${btnRow({ url: `/breeder/${breeder.slug}`, label: "View profile" })}
    </td></tr>
  </table>`;
}

function appendStandardSections(sections, data, accent, opts = {}) {
  sections.push(quickLinksRow(opts.quickLinks));
  sections.push(ctaBanner(
    opts.ctaTitle || "Ready to find your breeder?",
    opts.ctaBody || `Search ${data.totalBreeders.toLocaleString()}+ listings across the UK. Compare profiles, read reviews, and contact breeders with confidence.`,
    opts.ctaPrimary || { url: "/search", label: "Search breeders now" },
    accent
  ));
}

function wrapEmail({ title, subtitle, accentColor, heroImage, heroAlt, sections, badge, introText }) {
  const accent = accentColor || EDITORIAL.accent;
  const heroRow = heroImage
    ? `<tr><td style="padding:0;line-height:0;">
      <img src="${heroImage}" alt="${heroAlt || title}" width="600" style="display:block;width:100%;max-width:600px;height:280px;object-fit:cover;" />
    </td></tr>
    <tr><td style="height:4px;background:${accent};font-size:0;line-height:0;padding:0;">&nbsp;</td></tr>`
    : "";

  const introSection = introText ? introBlock(introText) : "";

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${EDITORIAL.bg};-webkit-text-size-adjust:100%;">
<table cellpadding="0" cellspacing="0" width="100%" style="background:${EDITORIAL.bg};"><tr><td align="center" style="padding:24px 12px;">
<table cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:${EDITORIAL.bg};font-family:${EDITORIAL.sans};">
  <tr><td style="background:${EDITORIAL.surface};border:1px solid ${EDITORIAL.border};border-radius:20px 20px 0 0;padding:40px 32px 36px;text-align:center;">
    ${emailLogoBlock()}
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${accent};font-family:${EDITORIAL.sans};">${badge || "From the BreedWise team"}</p>
    <h1 style="margin:0;font-size:30px;color:${EDITORIAL.heading};line-height:1.25;font-weight:400;font-family:${EDITORIAL.serif};">${title}</h1>
    ${subtitle ? `<p style="margin:14px auto 0;font-size:16px;color:${EDITORIAL.body};line-height:1.65;font-family:${EDITORIAL.sans};max-width:460px;">${subtitle}</p>` : ""}
  </td></tr>
  ${heroRow}
  <tr><td style="padding:32px 28px 36px;background:${EDITORIAL.bg};border:1px solid ${EDITORIAL.border};border-top:none;border-radius:0 0 20px 20px;">
    ${introSection}
    ${sectionDivider(accent)}
    ${sections.join("")}
    <table cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding:32px 8px 0;text-align:center;border-top:1px solid ${EDITORIAL.border};">
      <p style="margin:0;font-size:18px;font-weight:400;color:${EDITORIAL.heading};font-family:${EDITORIAL.serif};">Happy searching 🐾</p>
      <p style="margin:10px 0 0;font-size:14px;color:${EDITORIAL.body};line-height:1.65;font-family:${EDITORIAL.sans};">The BreedWise team — helping UK families find the right pet breeder, calmly and confidently.</p>
      <table cellpadding="0" cellspacing="0" align="center" style="margin:20px auto 0;"><tr>
        ${btn(`${SITE}`, "Visit breedwise.co.uk", accent)}
        ${btn(`${SITE}/education`, "Buyer guides", EDITORIAL.muted, true)}
      </tr></table>
      <p style="margin:20px 0 0;font-size:11px;color:${EDITORIAL.muted};line-height:1.6;font-family:${EDITORIAL.sans};">
        Directory only — we never sell animals.<br/>
        You're receiving this because you subscribed at breedwise.co.uk
      </p>
    </td></tr></table>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

async function fetchSiteData(adminClient) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    { count: newBreeders },
    { count: totalBreeders },
    { count: breedCount },
    { data: searchRows },
    { data: allBreeds },
    { data: featuredBreeders },
    { data: newBreederRows },
    { data: recentClaimed },
  ] = await Promise.all([
    adminClient.from("breeders").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
    adminClient.from("breeders").select("*", { count: "exact", head: true }).in("status", ["public_listing", "claimed_profile"]),
    adminClient.from("breeds").select("*", { count: "exact", head: true }).not("description", "is", null).neq("description", ""),
    adminClient.from("search_analytics").select("breed, location, animal").gte("searched_at", weekAgo).limit(300),
    adminClient.from("breeds").select("name, slug, animal_type, image_url, description, temperament, size").not("image_url", "is", null).limit(80),
    adminClient.from("breeders").select("name, slug, town, county, hero_image_url").eq("is_featured", true).gt("featured_until", new Date().toISOString()).limit(3),
    adminClient.from("breeders").select("name, slug, town, county, hero_image_url, created_at").gte("created_at", weekAgo).in("status", ["public_listing", "claimed_profile"]).order("created_at", { ascending: false }).limit(4),
    adminClient.from("breeders").select("name, slug, town, hero_image_url, claimed_at").eq("status", "claimed_profile").order("claimed_at", { ascending: false }).limit(3),
  ]);

  const breedCounts = {};
  const locationCounts = {};
  const animalCounts = {};
  (searchRows || []).forEach((r) => {
    if (r.breed) breedCounts[r.breed] = (breedCounts[r.breed] || 0) + 1;
    if (r.location) locationCounts[r.location] = (locationCounts[r.location] || 0) + 1;
    if (r.animal) animalCounts[r.animal] = (animalCounts[r.animal] || 0) + 1;
  });

  const trending = Object.entries(breedCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);
  const topLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);
  const breedsWithImages = (allBreeds || []).filter((b) => b.image_url);

  return {
    newBreeders: newBreeders || 0,
    totalBreeders: totalBreeders || 0,
    breedCount: breedCount || 0,
    trending,
    topLocations,
    animalCounts,
    breedsWithImages,
    featuredBreeders: featuredBreeders || [],
    newBreederRows: newBreederRows || [],
    recentClaimed: recentClaimed || [],
  };
}

function buildWeekly(data) {
  const heroBreed = data.breedsWithImages.find((b) => data.trending.includes(b.name)) || pickRandom(data.breedsWithImages);
  const sections = [
    statStrip([
      { value: data.totalBreeders.toLocaleString(), label: "Listings" },
      { value: String(data.newBreeders), label: "New this week" },
      { value: data.breedCount.toLocaleString(), label: "Breeds" },
    ]),
    card("This week on BreedWise", `We've added <strong>${data.newBreeders}</strong> new breeder listings in the last 7 days. Our directory now covers dogs, cats, birds, fish, reptiles and small pets — with encyclopedia entries, Google reviews, and side-by-side compare built in.`, {
      color: "#00BFA5",
      link: { url: "/search", label: "Search all breeders" },
      secondaryLink: { url: "/breeds", label: "Browse breeds", color: "#9333ea" },
    }),
  ];
  if (data.trending.length > 0) {
    sections.push(card("🔥 Trending breeds this week", `Buyers searched most for <strong>${data.trending.slice(0, 3).join("</strong>, <strong>")}</strong>. Compare listings, read Google reviews, and save favourites to compare later — no account needed to browse.`, {
      color: "#FF6B6B",
      skipImage: true,
      link: { url: `/search?breed=${encodeURIComponent(data.trending[0])}`, label: `Find ${data.trending[0]} breeders` },
      secondaryLink: { url: "/account/compare", label: "Open compare tool", color: "#6366f1" },
    }));
  }
  const weeklyTip = pickByDay(BUYER_TIPS);
  sections.push(tipBox(weeklyTip.title, weeklyTip.body, weeklyTip.color, { url: weeklyTip.link, label: "Read the full guide" }));
  appendStandardSections(sections, data, "#00BFA5");
  return {
    subject: `Your BreedWise weekly — ${data.trending[0] || "pet breeders"} trending now`,
    preview_text: `${data.newBreeders} new listings this week. ${data.trending[0] ? `${data.trending[0]} is trending.` : "Search breeders across the UK."}`,
    badge: "Weekly Roundup",
    title: "Your weekly pet breeder roundup",
    subtitle: "What's new on BreedWise this week",
    accentColor: "#00BFA5",
    heroImage: heroBreed?.image_url,
    heroAlt: heroBreed?.name,
    introText: `Here's your snapshot of the UK pet breeder directory — fresh listings, trending searches, and a buyer tip to keep you on track.`,
    sections,
  };
}

function buildBuyerTips(_data) {
  const shuffled = [...BUYER_TIPS].sort(() => Math.random() - 0.5);
  const uniqueTips = shuffled.slice(0, 3);
  const sections = [
    introBlock("Before you hand over a deposit, run through these essentials. Each takes minutes — and could save months of worry."),
    ...uniqueTips.map((t) =>
      card(`${t.emoji} ${t.title}`, t.body, {
        color: t.color,
        skipImage: true,
        link: { url: t.link, label: "Read the full guide" },
      })
    ),
    card("Free printable checklist", "Download our breeder checklist — health tests, council licences, paperwork, environment checks, and red flags. Print it and take it to every viewing.", {
      color: "#6366f1",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
      imageAlt: "Happy puppy",
      link: { url: "/tools/breeder-checklist", label: "Get the free checklist" },
      secondaryLink: { url: "/education/red-flags", label: "Red flags guide", color: "#FF6B6B" },
    }),
  ];
  appendStandardSections(sections, _data, "#FF6B6B", {
    ctaTitle: "Search with confidence",
    ctaBody: "Use BreedWise to find, compare, and contact responsible breeders across the UK.",
    ctaPrimary: { url: "/search", label: "Start searching" },
  });
  return {
    subject: "🛡️ Your buyer safety guide — stay smart, stay safe",
    preview_text: uniqueTips[0]?.body?.slice(0, 100) || "Essential tips for finding a responsible pet breeder.",
    badge: "Buyer Safety Guide",
    title: "Your buyer safety guide",
    subtitle: "A few minutes of reading could save months of worry",
    accentColor: "#FF6B6B",
    heroImage: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
    heroAlt: "Person with pet",
    sections,
  };
}

function buildBreedSpotlight(data) {
  const breed = pickRandom(data.breedsWithImages.length ? data.breedsWithImages : [{ name: "Labrador Retriever", slug: "labrador-retriever", animal_type: "dog", image_url: ANIMAL_FALLBACK_IMAGES.dog, description: "Friendly, outgoing, and active.", temperament: "Friendly, outgoing", size: "Large" }]);
  const img = breed.image_url || ANIMAL_FALLBACK_IMAGES[breed.animal_type] || ANIMAL_FALLBACK_IMAGES.default;
  const sections = [
    statStrip([
      { value: breed.size || "Varies", label: "Typical size" },
      { value: breed.animal_type || "Pet", label: "Animal type" },
      { value: "Free", label: "Encyclopedia" },
    ], "#9333ea"),
    card(`Meet the ${breed.name}`, `${breed.description?.slice(0, 320) || `${breed.name} is a popular choice for UK families.`}<br/><br/><strong>Temperament:</strong> ${breed.temperament || "Ask your breeder"}.`, {
      color: "#9333ea",
      skipImage: true,
      link: { url: `/breeds/${breed.slug}`, label: `Explore ${breed.name} encyclopedia` },
      secondaryLink: { url: `/search?breed=${encodeURIComponent(breed.name)}`, label: `Find ${breed.name} breeders` },
    }),
    tipBox("Smart buyer tip", "Save up to 3 breeders and compare them side by side before making contact. Look for claimed profiles, council licences, and health test details.", "#6366f1", { url: "/account/compare", label: "Try the compare tool" }),
    card("Questions to ask this breeder", "Ask about parent health tests, socialisation plans, council licence number, and what support they offer after collection. Our viewing checklist covers everything.", {
      color: "#00BFA5",
      skipImage: true,
      link: { url: "/guides/puppy-viewing-checklist", label: "Get the viewing checklist" },
      secondaryLink: { url: "/education/what-to-ask", label: "What to ask", color: "#0ea5e9" },
    }),
  ];
  appendStandardSections(sections, data, "#9333ea", {
    ctaTitle: `Find ${breed.name} breeders near you`,
    ctaBody: "Search by breed and location. Compare profiles and read Google reviews before you contact anyone.",
    ctaPrimary: { url: `/search?breed=${encodeURIComponent(breed.name)}`, label: `Search ${breed.name}` },
  });
  return {
    subject: `Breed spotlight: ${breed.name} — is it right for you?`,
    preview_text: `Everything you need to know about ${breed.name} before choosing a breeder.`,
    badge: "Breed Spotlight",
    title: `Spotlight: ${breed.name}`,
    subtitle: `${breed.animal_type ? breed.animal_type.charAt(0).toUpperCase() + breed.animal_type.slice(1) : "Pet"} breed guide`,
    accentColor: "#9333ea",
    heroImage: img,
    heroAlt: breed.name,
    introText: `Thinking about a ${breed.name}? Here's what you need to know before you start contacting breeders.`,
    sections,
  };
}

function buildFeaturedBreeders(data) {
  const breeders = data.featuredBreeders.length ? data.featuredBreeders : data.recentClaimed;
  const sections = [
    card("Gold featured breeders", "These breeders have upgraded to Gold membership for priority placement. Each has a verified, detailed profile with photos, breed info, and direct messaging.", {
      color: "#FFB545",
      skipImage: true,
      link: { url: "/search", label: "Browse all breeders" },
      secondaryLink: { url: "/breeder-benefits", label: "Breeder benefits", color: "#f97316" },
    }),
    ...breeders.slice(0, 3).map((b) => breederCard(b)),
  ];
  if (breeders.length === 0) {
    sections.push(card("Discover breeders near you", "Search by breed and location to find responsible breeders across the UK. Filter by animal type — dogs, cats, birds, and more.", {
      color: "#00BFA5",
      image: ANIMAL_FALLBACK_IMAGES.default,
      link: { url: "/near-me", label: "Find breeders near me" },
    }));
  }
  appendStandardSections(sections, data, "#FFB545", {
    ctaTitle: "Are you a breeder?",
    ctaBody: "Claim your free profile and get discovered by buyers searching BreedWise every day.",
    ctaPrimary: { url: "/claim", label: "Claim your profile" },
  });
  return {
    subject: "Featured breeders on BreedWise this week ⭐",
    preview_text: "Meet our Gold-tier featured breeders — verified profiles with photos and direct contact.",
    badge: "Featured Breeders",
    title: "Featured breeders",
    subtitle: "Gold members recommended for buyers",
    accentColor: "#FFB545",
    heroImage: breeders[0]?.hero_image_url || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    heroAlt: "Featured breeder",
    introText: "Hand-picked Gold members with detailed profiles — browse, compare, and message directly on BreedWise.",
    sections,
  };
}

function buildNewListings(data) {
  const sections = [
    statStrip([
      { value: String(data.newBreeders), label: "New listings" },
      { value: data.totalBreeders.toLocaleString(), label: "Total directory" },
      { value: data.trending[0] || "—", label: "Top search" },
    ], "#0ea5e9"),
    card("Fresh on BreedWise", `<strong>${data.newBreeders}</strong> new breeder listings joined the directory in the last 7 days. Be among the first to explore them — check licences, reviews, and availability before anyone else.`, {
      color: "#0ea5e9",
      skipImage: true,
      link: { url: "/search", label: "See all listings" },
      secondaryLink: { url: "/near-me", label: "Near me", color: "#14b8a6" },
    }),
  ];
  if (data.newBreederRows.length > 0) {
    sections.push(sectionLabel("New this week", "#0ea5e9"));
    sections.push(...data.newBreederRows.slice(0, 3).map((b) => breederCard(b)));
  } else {
    sections.push(card("Explore popular breeds", `Top searches this week: <strong>${data.trending.slice(0, 3).join("</strong>, <strong>") || "Labrador, Cockapoo, French Bulldog"}</strong>.`, {
      color: "#00BFA5",
      skipImage: true,
      link: { url: "/search", label: "Start searching" },
    }));
  }
  appendStandardSections(sections, data, "#0ea5e9");
  return {
    subject: `${data.newBreeders} new breeder listings this week on BreedWise`,
    preview_text: "Fresh listings added — explore new breeders across the UK.",
    badge: "New Listings",
    title: "New listings this week",
    subtitle: `${data.newBreeders} breeders joined the directory`,
    accentColor: "#0ea5e9",
    heroImage: data.newBreederRows[0]?.hero_image_url || pickRandom(data.breedsWithImages)?.image_url,
    heroAlt: "New listing",
    introText: "New breeders have joined BreedWise this week. Here's what's fresh in the directory.",
    sections,
  };
}

function buildMultiPet(data) {
  const animals = [
    { type: "cat", label: "Cats", emoji: "🐱" },
    { type: "bird", label: "Birds", emoji: "🦜" },
    { type: "reptile", label: "Reptiles", emoji: "🦎" },
    { type: "fish", label: "Fish", emoji: "🐠" },
    { type: "small-pet", label: "Small pets", emoji: "🐹" },
  ];
  const sections = [
    card("More than just dogs", "BreedWise lists breeders for cats, birds, fish, reptiles and small pets — not just dogs. Filter by animal type when you search, and explore our multi-species breed encyclopedia.", {
      color: "#ec4899",
      skipImage: true,
      link: { url: "/search", label: "Search all animal types" },
      secondaryLink: { url: "/breeds", label: "Breed encyclopedia", color: "#9333ea" },
    }),
  ];
  for (const a of animals.slice(0, 3)) {
    const breed = data.breedsWithImages.find((b) => b.animal_type === a.type);
    sections.push(card(`${a.emoji} ${a.label}`, breed
      ? `Explore ${breed.name} and other ${a.label.toLowerCase()} on BreedWise — compare breeders and read reviews.`
      : `Find ${a.label.toLowerCase()} breeders across the UK.`, {
      color: "#ec4899",
      image: breed?.image_url || ANIMAL_FALLBACK_IMAGES[a.type] || ANIMAL_FALLBACK_IMAGES.default,
      imageAlt: a.label,
      link: { url: `/search?animal=${a.type}`, label: `Find ${a.label.toLowerCase()}` },
    }));
  }
  appendStandardSections(sections, data, "#ec4899");
  return {
    subject: "Cats, birds, reptiles & more — search beyond dogs 🐾",
    preview_text: "BreedWise covers all pet types. Find your perfect companion today.",
    badge: "Multi-Pet",
    title: "Beyond dogs",
    subtitle: "Cats, birds, fish, reptiles & small pets",
    accentColor: "#ec4899",
    heroImage: ANIMAL_FALLBACK_IMAGES.bird,
    heroAlt: "Bird",
    introText: "Looking for something other than a dog? BreedWise covers the full spectrum of UK pet breeders.",
    sections,
  };
}

function buildSeasonal(data) {
  const s = season();
  const seasonalContent = {
    spring: { title: "Spring puppy season", body: "Spring is a popular time for new litters. Book viewings early, ask about socialisation plans, and never rush a decision.", extended: "Longer days mean more time for viewings — but popular breeds get booked quickly. Start your search early, save favourites to compare, and always visit in person before paying a deposit.", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80", color: "#059669" },
    summer: { title: "Summer travel with pets", body: "Planning a holiday or a long journey to collect your pet? Ask breeders about transport, insurance, and acclimatisation.", extended: "Never leave a pet in a hot car — even for a few minutes. Plan collection day carefully, bring a secure carrier, and schedule a vet check within the first week.", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80", color: "#0ea5e9" },
    autumn: { title: "Autumn preparation", body: "Cooler months mean more indoor time — ask breeders about crate training, exercise plans, and winter health care.", extended: "Shorter days affect exercise routines. Ask about the pet's current routine and how to transition smoothly into your home.", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80", color: "#f97316" },
    winter: { title: "Winter wellness", body: "Cold weather affects young pets. Ensure your home is ready, ask about vaccinations, and plan a warm, safe collection day.", extended: "Young animals feel the cold more than adults. Prepare a warm, draft-free space at home and ask the breeder about bedding, feeding, and first-night tips.", image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&q=80", color: "#6366f1" },
  };
  const content = seasonalContent[s];
  const tip = pickByDay(BUYER_TIPS);
  const sections = [
    card(content.title, `${content.body}<br/><br/>${content.extended}`, {
      color: content.color,
      skipImage: true,
      link: { url: "/guides", label: "Browse buyer guides" },
      secondaryLink: { url: "/search", label: "Search breeders", color: "#00BFA5" },
    }),
    tipBox(tip.title, tip.body, tip.color, { url: tip.link, label: "Read more" }),
  ];
  if (data.trending[0]) {
    sections.push(card(`Popular this ${s}`, `${data.trending[0]} is among the most searched breeds right now. Compare listings before you contact anyone.`, {
      color: "#00BFA5",
      skipImage: true,
      link: { url: `/search?breed=${encodeURIComponent(data.trending[0])}`, label: `Search ${data.trending[0]}` },
    }));
  }
  appendStandardSections(sections, data, content.color);
  return {
    subject: `${content.title} — your ${s} BreedWise update`,
    preview_text: content.body.slice(0, 120),
    badge: `${s.charAt(0).toUpperCase() + s.slice(1)} Edition`,
    title: content.title,
    subtitle: `Timely advice for ${s}`,
    accentColor: content.color,
    heroImage: content.image,
    heroAlt: content.title,
    introText: content.extended,
    sections,
  };
}

function buildBreederPromo(data) {
  const sections = [
    statStrip([
      { value: data.totalBreeders.toLocaleString(), label: "Buyers browsing" },
      { value: "Free", label: "To claim" },
      { value: "3", label: "Upgrade tiers" },
    ], "#f97316"),
    card("Grow your breeding business", "Thousands of buyers search BreedWise every month. Claim your free profile, add photos, list your breeds, and start receiving enquiries through our messaging system.", {
      color: "#f97316",
      skipImage: true,
      link: { url: "/claim", label: "Claim your free profile" },
      secondaryLink: { url: "/auth/signup", label: "Create account", color: "#00BFA5" },
    }),
    card("Upgrade for visibility", "Bronze (£5.99/mo), Silver (£7.99/mo) and Gold (£9.99/mo) plans give you priority in search, featured placement, analytics on profile views, and a Gold member badge buyers recognise.", {
      color: "#FFB545",
      skipImage: true,
      bullets: ["Priority placement in search results", "Featured badge & profile highlighting", "Profile view & enquiry analytics", "Direct messaging from buyers"],
      link: { url: "/breeder-benefits", label: "See breeder benefits" },
      secondaryLink: { url: "/breeder/dashboard", label: "Go to dashboard", color: "#00BFA5" },
    }),
    card("What's included free", "Every claimed profile gets a public listing, Google reviews integration, direct messaging, profile photos, breed info, and availability status — at no cost.", {
      color: "#00BFA5",
      skipImage: true,
      link: { url: "/claim", label: "Claim now — it's free" },
    }),
  ];
  appendStandardSections(sections, data, "#f97316", {
    quickLinks: [
      { label: "Claim profile", url: "/claim", color: "#f97316" },
      { label: "Breeder benefits", url: "/breeder-benefits", color: "#FFB545" },
      { label: "Dashboard", url: "/breeder/dashboard", color: "#00BFA5" },
      { label: "Sign up", url: "/auth/signup", color: "#6366f1" },
    ],
    ctaTitle: "Get discovered today",
    ctaBody: "Join thousands of UK breeders on BreedWise. Free to claim — upgrade when you're ready.",
    ctaPrimary: { url: "/claim", label: "Claim your profile" },
  });
  return {
    subject: "Get discovered by pet buyers — claim your BreedWise profile",
    preview_text: "Free to claim. Upgrade for priority placement in search results.",
    badge: "For Breeders",
    title: "Are you a breeder?",
    subtitle: "Join BreedWise — it's free to get started",
    accentColor: "#f97316",
    heroImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    heroAlt: "Breeder with dogs",
    introText: "Buyers are searching for responsible breeders right now. Make sure they can find you.",
    sections,
  };
}

function buildCompareTool(data) {
  const sections = [
    card("Compare up to 3 breeders side by side", "Can't decide? Save breeders with the heart icon, then compare location, Google rating, KC registration, council licence, health testing, and contact details — all in one view.", {
      color: "#6366f1",
      skipImage: true,
      bullets: ["Save breeders from any search result", "Compare licences, reviews & health info", "Contact your favourite when ready", "Free for all registered buyers"],
      link: { url: "/account/compare", label: "Open compare tool" },
      secondaryLink: { url: "/education/how-to-compare", label: "How to compare wisely", color: "#00BFA5" },
    }),
  ];
  if (data.trending[0]) {
    sections.push(card(`Start with ${data.trending[0]}`, `${data.trending[0]} is trending this week. Search breeders, save your top 3, then compare before you contact anyone.`, {
      color: "#9333ea",
      image: data.breedsWithImages.find((b) => b.name === data.trending[0])?.image_url,
      link: { url: `/search?breed=${encodeURIComponent(data.trending[0])}`, label: "Search now" },
    }));
  }
  appendStandardSections(sections, data, "#6366f1", {
    ctaTitle: "Make a confident choice",
    ctaBody: "Don't rush into the first breeder you find. Compare up to 3 profiles side by side — free on BreedWise.",
    ctaPrimary: { url: "/account/compare", label: "Start comparing" },
  });
  return {
    subject: "Compare breeders side by side — new on BreedWise",
    preview_text: "Save up to 3 breeders and compare licences, reviews, and health info in one view.",
    badge: "Compare Tool",
    title: "Compare before you contact",
    subtitle: "Make a confident, informed choice",
    accentColor: "#6366f1",
    heroImage: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
    heroAlt: "Compare breeders",
    introText: "Choosing a breeder is a big decision. Our compare tool lets you weigh up your options before you pick up the phone.",
    sections,
  };
}

function buildLocationPicks(data) {
  const loc = data.topLocations[0] || "London";
  const sections = [
    statStrip([
      { value: loc, label: "Top location" },
      { value: data.trending[0] || "—", label: "Top breed" },
      { value: data.totalBreeders.toLocaleString(), label: "UK listings" },
    ], "#14b8a6"),
    card(`Popular: ${loc}`, `Buyers are actively searching for breeders in <strong>${loc}</strong> and surrounding areas. Browse public listings, compare profiles, and read Google reviews before you contact anyone.`, {
      color: "#14b8a6",
      skipImage: true,
      link: { url: `/search?q=${encodeURIComponent(loc)}`, label: `Search breeders in ${loc}` },
      secondaryLink: { url: "/near-me", label: "Find near me", color: "#00BFA5" },
    }),
  ];
  if (data.topLocations.length > 1) {
    sections.push(card("More popular locations", data.topLocations.slice(1, 5).map((l) => `• <strong>${l}</strong>`).join("<br/>"), {
      color: "#00BFA5",
      skipImage: true,
      link: { url: "/near-me", label: "Find breeders near me" },
    }));
  }
  if (data.trending[0]) {
    sections.push(card(`Top breed in ${loc}`, `${data.trending[0]} is trending — find breeders near ${loc} and compare before you commit.`, {
      color: "#FF6B6B",
      skipImage: true,
      link: { url: `/search?q=${encodeURIComponent(loc)}&breed=${encodeURIComponent(data.trending[0])}`, label: "Search now" },
    }));
  }
  appendStandardSections(sections, data, "#14b8a6", {
    ctaTitle: `Find breeders in ${loc}`,
    ctaBody: "Search by location and breed. Compare profiles and contact breeders directly on BreedWise.",
    ctaPrimary: { url: `/search?q=${encodeURIComponent(loc)}`, label: `Search ${loc}` },
  });
  return {
    subject: `Top breeder searches in ${loc} — BreedWise picks`,
    preview_text: `Find pet breeders in ${loc} and across the UK.`,
    badge: "Location Picks",
    title: `Breeders in ${loc}`,
    subtitle: "Popular locations this week",
    accentColor: "#14b8a6",
    heroImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    heroAlt: loc,
    introText: `Regional search is one of the most popular ways buyers use BreedWise. Here's what's trending near ${loc}.`,
    sections,
  };
}

function buildEducation(_data) {
  const guide = pickRandom(EDUCATION_GUIDES);
  const tip = pickRandom(BUYER_TIPS);
  const related = EDUCATION_GUIDES.filter((g) => g.title !== guide.title).slice(0, 2);
  const sections = [
    statStrip([
      { value: "Free", label: "All guides" },
      { value: String(EDUCATION_GUIDES.length + BUYER_TIPS.length), label: "Topics" },
      { value: _data.totalBreeders.toLocaleString(), label: "Listings" },
    ], "#8b5cf6"),
    card(guide.title, `${guide.extended || guide.body}`, {
      color: "#8b5cf6",
      skipImage: true,
      bullets: guide.bullets,
      link: { url: guide.link, label: guide.cta || "Read the full guide" },
      secondaryLink: { url: "/tools/breeder-checklist", label: "Free checklist", color: "#6366f1" },
    }),
    tipBox(`${tip.emoji} ${tip.title}`, tip.body, tip.color, { url: tip.link, label: "Learn more" }),
    sectionLabel("More free guides", "#8b5cf6"),
    miniGuideCards(related, "#8b5cf6"),
    card("Full education hub", "Red flags, health testing, what to ask, puppy contracts, socialisation, transport, and more — all free on BreedWise. No sign-up required to read.", {
      color: "#00BFA5",
      skipImage: true,
      link: { url: "/education", label: "Explore education hub" },
      secondaryLink: { url: "/search", label: "Search breeders", color: "#00BFA5" },
    }),
  ];
  appendStandardSections(sections, _data, "#8b5cf6", {
    ctaTitle: "Put this guide into practice",
    ctaBody: "Search UK breeders, compare profiles, and use our free tools to make a confident decision.",
    ctaPrimary: { url: guide.link, label: guide.cta || "Read the guide" },
  });
  return {
    subject: `${guide.title} — BreedWise buyer education`,
    preview_text: guide.body.slice(0, 120),
    badge: "Education",
    title: guide.title,
    subtitle: "Free guides for pet buyers",
    accentColor: "#8b5cf6",
    heroImage: guide.image,
    heroAlt: guide.title,
    introText: guide.extended || guide.body,
    sections,
  };
}

const BUILDERS = {
  weekly: buildWeekly,
  "buyer-tips": buildBuyerTips,
  "breed-spotlight": buildBreedSpotlight,
  "featured-breeders": buildFeaturedBreeders,
  "new-listings": buildNewListings,
  "multi-pet": buildMultiPet,
  seasonal: buildSeasonal,
  "breeder-promo": buildBreederPromo,
  "compare-tool": buildCompareTool,
  "location-picks": buildLocationPicks,
  education: buildEducation,
};

export async function generateNewsletterDraft(adminClient, topic = "weekly") {
  const data = await fetchSiteData(adminClient);

  let resolvedTopic = topic === "buyer" ? "buyer-tips" : topic;
  if (resolvedTopic === "surprise") {
    resolvedTopic = pickRandom(Object.keys(BUILDERS));
  }

  const builder = BUILDERS[resolvedTopic] || BUILDERS.weekly;
  const draft = builder(data);

  const html_body = wrapEmail(draft);

  return {
    subject: draft.subject,
    preview_text: draft.preview_text,
    html_body,
    text_body: `${draft.title}\n\n${draft.subtitle || ""}\n\n${draft.introText || draft.preview_text}\n\nVisit ${SITE}`,
    topic: resolvedTopic,
  };
}

export function getNewsletterTopics() {
  return NEWSLETTER_TOPICS;
}
