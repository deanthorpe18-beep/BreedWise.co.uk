/** Auto-generated newsletter content — multiple templates with colour and images */

const SITE = "https://breedwise.co.uk";

function emailLogoBlock(accentColor = "#00BFA5") {
  return `<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 12px;">
    <tr>
      <td align="center" style="padding:0;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="width:56px;height:56px;border-radius:16px;background:#ffffff;box-shadow:0 4px 14px rgba(0,0,0,0.15);font-size:30px;line-height:56px;">🐾</td>
          </tr>
        </table>
        <p style="margin:10px 0 0;font-family:Inter,Segoe UI,system-ui,sans-serif;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">
          BreedWise<span style="font-weight:600;opacity:0.85;">.co.uk</span>
        </p>
      </td>
    </tr>
  </table>`;
}

function pawDivider(color = "#00BFA5") {
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin:8px 0 20px;"><tr><td align="center" style="font-size:18px;color:${color};letter-spacing:8px;opacity:0.6;">🐾 · 🐱 · 🐦</td></tr></table>`;
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
  { title: "How to compare breeders", body: "Learn what to look for when comparing listings — licences, reviews, health tests, and transparency.", link: "/education/how-to-compare", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80" },
  { title: "Puppy contract essentials", body: "A written contract protects you and the breeder. Know what should be included before you sign.", link: "/guides/puppy-contract-guide", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80" },
  { title: "Finding a reputable breeder", body: "Step-by-step guide to searching, shortlisting, and contacting breeders safely.", link: "/guides/find-reputable-breeder", image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80" },
  { title: "Transporting your new pet", body: "Planning the journey home? Tips for a safe, stress-free trip with your new companion.", link: "/guides/transporting-your-puppy", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80" },
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

function btn(url, label, bg = "#00BFA5") {
  return `<table cellpadding="0" cellspacing="0" style="margin:18px 0 0;"><tr><td style="border-radius:9999px;background:${bg};box-shadow:0 4px 14px ${bg}55;"><a href="${url}" style="display:inline-block;padding:14px 32px;color:#fff;font-weight:800;font-size:15px;text-decoration:none;font-family:Inter,Segoe UI,system-ui,sans-serif;">${label} →</a></td></tr></table>`;
}

function card(heading, body, opts = {}) {
  const { color = "#00BFA5", link, image, imageAlt, emoji } = opts;
  const headingText = emoji ? `${emoji} ${heading}` : heading;
  const imgBlock = image
    ? `<img src="${image}" alt="${imageAlt || heading}" width="100%" style="display:block;width:100%;max-width:552px;height:auto;border-radius:16px 16px 0 0;margin:0;" />`
    : "";
  const linkBlock = link ? btn(`${SITE}${link.url}`, link.label, color) : "";
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:22px;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;background:#fff;box-shadow:0 2px 12px rgba(15,23,42,0.06);">
    ${imgBlock ? `<tr><td style="padding:0;line-height:0;">${imgBlock}</td></tr>` : ""}
    <tr><td style="padding:22px 26px;border-left:5px solid ${color};">
      <h3 style="margin:0 0 10px;font-size:18px;color:#0f172a;font-family:Inter,Segoe UI,system-ui,sans-serif;font-weight:800;">${headingText}</h3>
      <p style="margin:0;color:#475569;line-height:1.7;font-size:15px;font-family:Inter,Segoe UI,system-ui,sans-serif;">${body}</p>
      ${linkBlock}
    </td></tr>
  </table>`;
}

function tipBox(title, body, color = "#FFB545") {
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:22px;"><tr><td style="background:linear-gradient(135deg,${color}18,${color}08);border:2px dashed ${color}55;border-radius:20px;padding:22px 26px;">
    <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${color};font-family:Inter,Segoe UI,system-ui,sans-serif;">✨ Good to know</p>
    <p style="margin:0 0 8px;font-size:17px;font-weight:800;color:#0f172a;font-family:Inter,Segoe UI,system-ui,sans-serif;">${title}</p>
    <p style="margin:0;color:#475569;line-height:1.7;font-size:15px;font-family:Inter,Segoe UI,system-ui,sans-serif;">${body}</p>
  </td></tr></table>`;
}

function breederCard(breeder) {
  const img = breeder.hero_image_url || ANIMAL_FALLBACK_IMAGES.default;
  const loc = [breeder.town, breeder.county].filter(Boolean).join(", ");
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <tr><td style="padding:0;line-height:0;"><img src="${img}" alt="${breeder.name}" width="100%" style="display:block;width:100%;height:180px;object-fit:cover;" /></td></tr>
    <tr><td style="padding:16px 20px;background:#fff;">
      <p style="margin:0;font-size:16px;font-weight:700;color:#0f172a;font-family:Inter,system-ui,sans-serif;">${breeder.name}</p>
      <p style="margin:4px 0 12px;font-size:13px;color:#64748b;">📍 ${loc}</p>
      ${btn(`${SITE}/breeder/${breeder.slug}`, "View profile", "#FFB545")}
    </td></tr>
  </table>`;
}

function wrapEmail({ title, subtitle, accentColor, heroImage, heroAlt, sections, badge }) {
  const heroBlock = heroImage
    ? `<img src="${heroImage}" alt="${heroAlt || title}" width="600" style="display:block;width:100%;max-width:600px;height:240px;object-fit:cover;" />`
    : "";

  const peach = "#FFF5F0";
  const teal = accentColor || "#00BFA5";

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;">
<div style="font-family:Inter,Segoe UI,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(145deg,${teal} 0%,#00a98e 45%,#FF8A80 100%);">
    <tr><td style="padding:32px 24px 28px;text-align:center;">
      ${emailLogoBlock(teal)}
      <p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.9);">${badge || "From the BreedWise team"}</p>
      <h1 style="margin:0;font-size:28px;color:#fff;line-height:1.2;font-weight:900;text-shadow:0 2px 8px rgba(0,0,0,0.12);">${title}</h1>
      ${subtitle ? `<p style="margin:12px 0 0;font-size:16px;color:rgba(255,255,255,0.95);line-height:1.55;font-weight:500;">${subtitle}</p>` : ""}
    </td></tr>
  </table>
  ${heroBlock}
  <div style="padding:24px 18px 36px;background:linear-gradient(180deg,${peach}22 0%,#f8fafc 120px);">
    ${pawDivider(teal)}
    ${sections.join("")}
    <table cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding:24px 12px;text-align:center;border-top:2px dashed #e2e8f0;">
      <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">Happy searching! 🐾</p>
      <p style="margin:8px 0 0;font-size:14px;color:#64748b;line-height:1.6;">The BreedWise team — helping UK families find the right pet breeder, calmly and confidently.</p>
      <p style="margin:14px 0 0;"><a href="${SITE}" style="color:${teal};font-weight:800;text-decoration:none;font-size:15px;">breedwise.co.uk</a></p>
      <p style="margin:14px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">Dogs, cats, birds, fish, reptiles &amp; small pets · Directory only — we never sell animals.</p>
    </td></tr></table>
  </div>
</div></body></html>`;
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
    card("This week on BreedWise", `${data.totalBreeders.toLocaleString()} breeder listings across the UK — dogs, cats, birds, fish, reptiles and small pets. <strong>${data.newBreeders}</strong> new listings added in the last 7 days, with <strong>${data.breedCount.toLocaleString()}</strong> breeds in our encyclopedia.`, {
      color: "#00BFA5",
      link: { url: "/search", label: "Search all breeders" },
    }),
  ];
  if (data.trending.length > 0) {
    sections.push(card("🔥 Trending breeds", `Buyers searched most for: <strong>${data.trending.slice(0, 3).join("</strong>, <strong>")}</strong>. Compare listings, read Google reviews, and save favourites to compare later.`, {
      color: "#FF6B6B",
      image: heroBreed?.image_url,
      imageAlt: heroBreed?.name,
      link: { url: `/search?breed=${encodeURIComponent(data.trending[0])}`, label: `Find ${data.trending[0]} breeders` },
    }));
  }
  const weeklyTip = pickByDay(BUYER_TIPS);
  sections.push(tipBox(weeklyTip.title, weeklyTip.body));
  return {
    subject: `Your BreedWise weekly — ${data.trending[0] || "pet breeders"} trending now`,
    preview_text: `${data.newBreeders} new listings this week. ${data.trending[0] ? `${data.trending[0]} is trending.` : "Search breeders across the UK."}`,
    badge: "Weekly Roundup",
    title: "Your weekly pet breeder roundup",
    subtitle: "What's new on BreedWise this week",
    accentColor: "#00BFA5",
    heroImage: heroBreed?.image_url,
    heroAlt: heroBreed?.name,
    sections,
  };
}

function buildBuyerTips(_data) {
  const shuffled = [...BUYER_TIPS].sort(() => Math.random() - 0.5);
  const uniqueTips = shuffled.slice(0, 3);
  const sections = uniqueTips.map((t) =>
    card(t.title, t.body, { color: t.color, emoji: t.emoji, link: { url: t.link, label: "Read the full guide" } })
  );
  sections.push(card("Free breeder checklist", "Download our printable checklist — health tests, licences, paperwork, and red flags to watch for before you hand over any money. It's free, and it might be the most useful thing you print this month.", {
    color: "#6366f1",
    emoji: "📥",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
    imageAlt: "Happy puppy",
    link: { url: "/tools/breeder-checklist", label: "Get the checklist" },
  }));
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
    card(`Meet the ${breed.name}`, breed.description?.slice(0, 280) || `${breed.name} is a popular choice for UK families. Learn about temperament, exercise needs, and what to ask a responsible breeder.`, {
      color: "#9333ea",
      image: img,
      imageAlt: breed.name,
      link: { url: `/breeds/${breed.slug}`, label: `Explore ${breed.name} in our encyclopedia` },
    }),
    card("Temperament & size", `<strong>Temperament:</strong> ${breed.temperament || "Varies — ask your breeder"}.<br/><strong>Size:</strong> ${breed.size || "See breed guide"}.<br/>Always meet the parent dogs and ask about health testing specific to this breed.`, {
      color: "#00BFA5",
      link: { url: `/search?breed=${encodeURIComponent(breed.name)}`, label: `Find ${breed.name} breeders` },
    }),
    tipBox("Did you know?", `You can save breeders to your account and compare up to 3 side by side before making contact.`, "#6366f1"),
  ];
  return {
    subject: `Breed spotlight: ${breed.name} — is it right for you?`,
    preview_text: `Everything you need to know about ${breed.name} before choosing a breeder.`,
    badge: "Breed Spotlight",
    title: `Spotlight: ${breed.name}`,
    subtitle: `${breed.animal_type ? breed.animal_type.charAt(0).toUpperCase() + breed.animal_type.slice(1) : "Pet"} breed guide`,
    accentColor: "#9333ea",
    heroImage: img,
    heroAlt: breed.name,
    sections,
  };
}

function buildFeaturedBreeders(data) {
  const breeders = data.featuredBreeders.length ? data.featuredBreeders : data.recentClaimed;
  const sections = [
    card("Gold featured breeders", "These breeders have upgraded to Gold membership for priority placement. Each has a verified, detailed profile on BreedWise.", {
      color: "#FFB545",
      link: { url: "/search", label: "Browse all breeders" },
    }),
    ...breeders.slice(0, 3).map((b) => breederCard(b)),
  ];
  if (breeders.length === 0) {
    sections.push(card("Discover breeders near you", "Search by breed and location to find responsible breeders across the UK.", {
      color: "#00BFA5",
      image: ANIMAL_FALLBACK_IMAGES.default,
      link: { url: "/near-me", label: "Find breeders near me" },
    }));
  }
  return {
    subject: "Featured breeders on BreedWise this week ⭐",
    preview_text: "Meet our Gold-tier featured breeders — verified profiles with photos and direct contact.",
    badge: "Featured Breeders",
    title: "Featured breeders",
    subtitle: "Gold members recommended for buyers",
    accentColor: "#FFB545",
    heroImage: breeders[0]?.hero_image_url || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    heroAlt: "Featured breeder",
    sections,
  };
}

function buildNewListings(data) {
  const sections = [
    card("Fresh on BreedWise", `<strong>${data.newBreeders}</strong> new breeder listings were added in the last 7 days. Be among the first to explore them.`, {
      color: "#0ea5e9",
      link: { url: "/search", label: "See all listings" },
    }),
  ];
  if (data.newBreederRows.length > 0) {
    sections.push(...data.newBreederRows.slice(0, 3).map((b) => breederCard(b)));
  } else {
    sections.push(card("Explore popular breeds", `Top searches this week: ${data.trending.slice(0, 3).join(", ") || "Labrador, Cockapoo, French Bulldog"}.`, {
      color: "#00BFA5",
      image: pickRandom(data.breedsWithImages)?.image_url || ANIMAL_FALLBACK_IMAGES.dog,
      link: { url: "/search", label: "Start searching" },
    }));
  }
  return {
    subject: `${data.newBreeders} new breeder listings this week on BreedWise`,
    preview_text: "Fresh listings added — explore new breeders across the UK.",
    badge: "New Listings",
    title: "New listings this week",
    subtitle: `${data.newBreeders} breeders joined the directory`,
    accentColor: "#0ea5e9",
    heroImage: data.newBreederRows[0]?.hero_image_url || pickRandom(data.breedsWithImages)?.image_url,
    heroAlt: "New listing",
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
    card("More than just dogs", "BreedWise lists breeders for cats, birds, fish, reptiles and small pets — not just dogs. Filter by animal type when you search.", {
      color: "#ec4899",
      image: ANIMAL_FALLBACK_IMAGES.cat,
      imageAlt: "Cat",
      link: { url: "/search", label: "Search all animal types" },
    }),
  ];
  for (const a of animals.slice(0, 3)) {
    const breed = data.breedsWithImages.find((b) => b.animal_type === a.type);
    sections.push(card(`${a.emoji} ${a.label}`, breed
      ? `Explore ${breed.name} and other ${a.label.toLowerCase()} on BreedWise.`
      : `Find ${a.label.toLowerCase()} breeders across the UK.`, {
      color: "#ec4899",
      image: breed?.image_url || ANIMAL_FALLBACK_IMAGES[a.type] || ANIMAL_FALLBACK_IMAGES.default,
      imageAlt: a.label,
      link: { url: `/search?animal=${a.type}`, label: `Find ${a.label.toLowerCase()}` },
    }));
  }
  return {
    subject: "Cats, birds, reptiles & more — search beyond dogs 🐾",
    preview_text: "BreedWise covers all pet types. Find your perfect companion today.",
    badge: "Multi-Pet",
    title: "Beyond dogs",
    subtitle: "Cats, birds, fish, reptiles & small pets",
    accentColor: "#ec4899",
    heroImage: ANIMAL_FALLBACK_IMAGES.bird,
    heroAlt: "Bird",
    sections,
  };
}

function buildSeasonal(data) {
  const s = season();
  const seasonalContent = {
    spring: { title: "Spring puppy season", body: "Spring is a popular time for new litters. Book viewings early, ask about socialisation plans, and never rush a decision.", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80", color: "#059669" },
    summer: { title: "Summer travel with pets", body: "Planning a holiday? Ask breeders about pet transport, insurance, and acclimatisation before collecting your new companion.", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80", color: "#0ea5e9" },
    autumn: { title: "Autumn preparation", body: "Cooler months mean more indoor time — ask breeders about crate training, exercise plans, and winter health care.", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80", color: "#f97316" },
    winter: { title: "Winter wellness", body: "Cold weather affects young pets. Ensure your home is ready, ask about vaccinations, and plan a warm, safe collection day.", image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&q=80", color: "#6366f1" },
  };
  const content = seasonalContent[s];
  const sections = [
    card(content.title, content.body, {
      color: content.color,
      image: content.image,
      link: { url: "/guides", label: "Browse buyer guides" },
    }),
    tipBox("Seasonal reminder", pickByDay(BUYER_TIPS).body, content.color),
  ];
  if (data.trending[0]) {
    sections.push(card(`Popular this ${s}`, `${data.trending[0]} is among the most searched breeds right now.`, {
      color: "#00BFA5",
      link: { url: `/search?breed=${encodeURIComponent(data.trending[0])}`, label: `Search ${data.trending[0]}` },
    }));
  }
  return {
    subject: `${content.title} — your ${s} BreedWise update`,
    preview_text: content.body.slice(0, 120),
    badge: `${s.charAt(0).toUpperCase() + s.slice(1)} Edition`,
    title: content.title,
    subtitle: `Timely advice for ${s}`,
    accentColor: content.color,
    heroImage: content.image,
    heroAlt: content.title,
    sections,
  };
}

function buildBreederPromo(data) {
  const sections = [
    card("Grow your breeding business", "Thousands of buyers search BreedWise every month. Claim your free profile, add photos, and start receiving enquiries.", {
      color: "#f97316",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
      link: { url: "/claim", label: "Claim your free profile" },
    }),
    card("Upgrade for visibility", "Bronze (£5.99/mo), Silver (£14.99/mo) and Gold (£29.99/mo) plans give you priority in search, featured placement, and analytics on profile views.", {
      color: "#FFB545",
      link: { url: "/breeder-benefits", label: "See breeder benefits" },
    }),
    card("What you get free", "✓ Public listing & Google reviews<br/>✓ Direct messaging from buyers<br/>✓ Profile photos & breed info<br/>✓ Availability status badge", {
      color: "#00BFA5",
      link: { url: "/breeder/dashboard", label: "Go to dashboard" },
    }),
  ];
  return {
    subject: "Get discovered by pet buyers — claim your BreedWise profile",
    preview_text: "Free to claim. Upgrade for priority placement in search results.",
    badge: "For Breeders",
    title: "Are you a breeder?",
    subtitle: "Join BreedWise — it's free to get started",
    accentColor: "#f97316",
    heroImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    heroAlt: "Breeder with dogs",
    sections,
  };
}

function buildCompareTool(data) {
  const sections = [
    card("Compare up to 3 breeders", "Can't decide? Save breeders with the heart icon, then compare them side by side — location, Google rating, KC registration, council licence, health testing, and contact details.", {
      color: "#6366f1",
      image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
      link: { url: "/account/compare", label: "Open compare tool" },
    }),
    card("How to compare wisely", "Look for verified profiles, council licences, health test info, and consistent Google reviews. Our education hub walks you through every step.", {
      color: "#00BFA5",
      link: { url: "/education/how-to-compare", label: "How to compare breeders" },
    }),
  ];
  if (data.trending[0]) {
    sections.push(card(`Start with ${data.trending[0]}`, `Search ${data.trending[0]} breeders, save your favourites, then compare.`, {
      color: "#9333ea",
      image: data.breedsWithImages.find((b) => b.name === data.trending[0])?.image_url,
      link: { url: `/search?breed=${encodeURIComponent(data.trending[0])}`, label: "Search now" },
    }));
  }
  return {
    subject: "Compare breeders side by side — new on BreedWise",
    preview_text: "Save up to 3 breeders and compare licences, reviews, and health info in one view.",
    badge: "Compare Tool",
    title: "Compare before you contact",
    subtitle: "Make a confident, informed choice",
    accentColor: "#6366f1",
    heroImage: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
    heroAlt: "Compare breeders",
    sections,
  };
}

function buildLocationPicks(data) {
  const loc = data.topLocations[0] || "London";
  const sections = [
    card(`Popular: ${loc}`, `Buyers are searching for breeders in ${loc} and surrounding areas. Browse public listings and compare before you contact anyone.`, {
      color: "#14b8a6",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
      imageAlt: "UK city",
      link: { url: `/search?q=${encodeURIComponent(loc)}`, label: `Search breeders in ${loc}` },
    }),
  ];
  if (data.topLocations.length > 1) {
    sections.push(card("More popular locations", data.topLocations.slice(1, 4).map((l) => `• ${l}`).join("<br/>"), {
      color: "#00BFA5",
      link: { url: "/near-me", label: "Find breeders near me" },
    }));
  }
  if (data.trending[0]) {
    sections.push(card(`Top breed in ${loc}`, `${data.trending[0]} is trending — find breeders near ${loc}.`, {
      color: "#FF6B6B",
      link: { url: `/search?q=${encodeURIComponent(loc)}&breed=${encodeURIComponent(data.trending[0])}`, label: "Search now" },
    }));
  }
  return {
    subject: `Top breeder searches in ${loc} — BreedWise picks`,
    preview_text: `Find pet breeders in ${loc} and across the UK.`,
    badge: "Location Picks",
    title: `Breeders in ${loc}`,
    subtitle: "Popular locations this week",
    accentColor: "#14b8a6",
    heroImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    heroAlt: loc,
    sections,
  };
}

function buildEducation(_data) {
  const guide = pickRandom(EDUCATION_GUIDES);
  const tip = pickRandom(BUYER_TIPS);
  const sections = [
    card(guide.title, guide.body, {
      color: "#8b5cf6",
      image: guide.image,
      link: { url: guide.link, label: "Read the full guide" },
    }),
    card(tip.title, tip.body, {
      color: tip.color,
      link: { url: tip.link, label: "Learn more" },
    }),
    card("All buyer guides", "Red flags, health testing, what to ask, puppy contracts, socialisation, and more — all free on BreedWise.", {
      color: "#00BFA5",
      link: { url: "/education", label: "Explore education hub" },
    }),
  ];
  return {
    subject: `${guide.title} — BreedWise buyer education`,
    preview_text: guide.body.slice(0, 120),
    badge: "Education",
    title: guide.title,
    subtitle: "Free guides for pet buyers",
    accentColor: "#8b5cf6",
    heroImage: guide.image,
    heroAlt: guide.title,
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
    text_body: `${draft.title}\n\n${draft.subtitle || ""}\n\n${draft.preview_text}\n\nVisit ${SITE}`,
    topic: resolvedTopic,
  };
}

export function getNewsletterTopics() {
  return NEWSLETTER_TOPICS;
}
