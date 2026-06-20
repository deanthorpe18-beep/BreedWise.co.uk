/** Auto-generated newsletter content from site data */

function wrapHtml(title, sections) {
  const body = sections
    .map(
      (s) => `<div style="margin-bottom:24px;">
      <h3 style="color:#00BFA5;margin:0 0 8px;font-size:16px;">${s.heading}</h3>
      <p style="margin:0;color:#475569;line-height:1.6;font-size:14px;">${s.body}</p>
      ${s.link ? `<p style="margin:12px 0 0;"><a href="${s.link.url}" style="color:#00BFA5;font-weight:600;text-decoration:none;">${s.link.label} →</a></p>` : ""}
    </div>`
    )
    .join("");

  return `<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#2D3436;">
    <p style="font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#00BFA5;margin:0 0 8px;">BreedWise Weekly</p>
    <h1 style="font-size:24px;margin:0 0 20px;color:#0f172a;">${title}</h1>
    ${body}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
      <p style="margin:0;">BreedWise — UK pet breeder directory</p>
      <p style="margin:8px 0 0;"><a href="https://breedwise.co.uk" style="color:#00BFA5;">breedwise.co.uk</a></p>
    </div>
  </div>`;
}

export async function generateNewsletterDraft(adminClient, topic = "weekly") {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    { count: newBreeders },
    { data: topBreeds },
    { data: guides },
  ] = await Promise.all([
    adminClient
      .from("breeders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    adminClient
      .from("search_analytics")
      .select("breed")
      .gte("searched_at", weekAgo)
      .not("breed", "is", null)
      .limit(200),
    adminClient.from("breeds").select("name, slug, animal_type").limit(3),
  ]);

  const breedCounts = {};
  (topBreeds || []).forEach((r) => {
    if (r.breed) breedCounts[r.breed] = (breedCounts[r.breed] || 0) + 1;
  });
  const trending = Object.entries(breedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const sections = [
    {
      heading: "This week on BreedWise",
      body: `We now list thousands of pet breeders across the UK — dogs, cats, birds, fish, reptiles and small pets. ${newBreeders || 0} new listings were added in the last 7 days.`,
      link: { url: "https://breedwise.co.uk/search", label: "Search breeders" },
    },
  ];

  if (trending.length > 0) {
    sections.push({
      heading: "Trending breeds",
      body: `Buyers are searching most for: ${trending.join(", ")}. Compare listings, read reviews, and save your favourites.`,
      link: { url: `https://breedwise.co.uk/search?breed=${encodeURIComponent(trending[0])}`, label: `Find ${trending[0]} breeders` },
    });
  }

  sections.push({
    heading: "Buyer tip of the week",
    body: "Always visit the breeder in person, ask about health testing, and request to see the mother with her litter. Our red flags guide helps you spot warning signs before you commit.",
    link: { url: "https://breedwise.co.uk/education/red-flags", label: "Read red flags guide" },
  });

  if ((guides || []).length > 0) {
    const g = guides[0];
    sections.push({
      heading: "From the breed encyclopedia",
      body: `Explore our guide to the ${g.name} — temperament, exercise needs, and what to expect from a responsible breeder.`,
      link: { url: `https://breedwise.co.uk/breeds/${g.slug}`, label: `Learn about ${g.name}` },
    });
  }

  sections.push({
    heading: "Are you a breeder?",
    body: "Claim your free profile, add photos, and upgrade for priority placement in search results. Bronze plans start at £5.99/month.",
    link: { url: "https://breedwise.co.uk/breeder-benefits", label: "Breeder benefits" },
  });

  const subject =
    topic === "buyer"
      ? "Finding the right pet breeder — BreedWise tips"
      : `Your BreedWise update — ${trending[0] || "pet breeders"} & more`;

  const html_body = wrapHtml("Your weekly pet breeder roundup", sections);
  const text_body = sections.map((s) => `${s.heading}\n${s.body}`).join("\n\n");

  return {
    subject,
    preview_text: sections[0].body.slice(0, 120),
    html_body,
    text_body,
  };
}
