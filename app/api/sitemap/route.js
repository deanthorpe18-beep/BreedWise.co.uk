import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBreeds } from "@lib/breeders";

function urlEntry(loc, priority, changefreq, lastmod) {
  let xml = `  <url>\n    <loc>${loc}</loc>\n`;
  if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += `    <changefreq>${changefreq}</changefreq>\n`;
  xml += `    <priority>${priority}</priority>\n  </url>\n`;
  return xml;
}

export async function GET() {
  const baseUrl = "https://breedwise.co.uk";
  const today = new Date().toISOString().split("T")[0];

  const supabase = createClient();

  // Fetch real breeder slugs
  const { data: breeders, error } = await supabase
    .from("breeders")
    .select("slug, town, updated_at")
    .in("status", ["public_listing", "claimed_profile"]);

  if (error) {
    console.error("Sitemap: failed to fetch breeders:", error.message);
  }

  const breeds = getBreeds();

  // Get unique towns from real breeders
  const uniqueTowns = [...new Set((breeders || []).map((b) => b.town).filter(Boolean))];

  const staticPaths = [
    { path: "", priority: "1.0" },
    { path: "/search", priority: "0.9" },
    { path: "/breeds", priority: "0.8" },
    { path: "/guides", priority: "0.8" },
    { path: "/education", priority: "0.8" },
    { path: "/claim", priority: "0.7" },
    { path: "/breeder-benefits", priority: "0.7" },
    { path: "/request-removal", priority: "0.3" },
    { path: "/suggest-edit", priority: "0.3" },
    { path: "/privacy", priority: "0.3" },
    { path: "/terms", priority: "0.3" },
    { path: "/disclaimer", priority: "0.3" },
    { path: "/editorial-policy", priority: "0.3" },
    { path: "/listing-policy", priority: "0.3" },
    { path: "/data-sources", priority: "0.3" },
    { path: "/corrections-removals", priority: "0.3" },
    { path: "/kennel-club", priority: "0.5" },
    { path: "/near-me", priority: "0.6" },
    { path: "/tools/puppy-cost-calculator", priority: "0.7" },
    { path: "/tools/breeder-checklist", priority: "0.7" },
    { path: "/guides/find-reputable-breeder", priority: "0.7" },
  ];

  const educationPaths = [
    "what-to-ask",
    "red-flags",
    "how-to-compare",
    "health-testing",
    "how-to-use-safely",
  ];

  const guidePaths = [
    "puppy-contract-guide",
    "puppy-socialisation",
    "puppy-viewing-checklist",
    "transporting-your-puppy",
    "choosing-a-breeder",
    "questions-to-ask",
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  for (const { path, priority } of staticPaths) {
    xml += urlEntry(`${baseUrl}${path}`, priority, "weekly", today);
  }

  // Education pages
  for (const slug of educationPaths) {
    xml += urlEntry(`${baseUrl}/education/${slug}`, "0.6", "monthly", today);
  }

  // Guide pages
  for (const slug of guidePaths) {
    xml += urlEntry(`${baseUrl}/guides/${slug}`, "0.6", "monthly", today);
  }

  // Real breeder pages
  for (const breeder of breeders || []) {
    const lastmod = breeder.updated_at ? breeder.updated_at.split("T")[0] : today;
    xml += urlEntry(`${baseUrl}/breeder/${breeder.slug}`, "0.8", "weekly", lastmod);
  }

  // Town pages
  for (const town of uniqueTowns) {
    const townSlug = town.toLowerCase().replace(/\s+/g, "-");
    xml += urlEntry(`${baseUrl}/england/west-sussex/west-sussex/${townSlug}/dog-breeders`, "0.7", "weekly", today);
    for (const breed of breeds) {
      const breedSlug = breed.toLowerCase().replace(/\s+/g, "-");
      xml += urlEntry(`${baseUrl}/england/west-sussex/west-sussex/${townSlug}/${breedSlug}-breeders`, "0.6", "weekly", today);
    }
  }

  // Breed pages
  for (const breed of breeds) {
    const breedSlug = breed.toLowerCase().replace(/\s+/g, "-");
    xml += urlEntry(`${baseUrl}/breeders/${breedSlug}`, "0.7", "weekly", today);
    xml += urlEntry(`${baseUrl}/breeds/${breedSlug}`, "0.7", "weekly", today);
    for (const town of uniqueTowns) {
      const townSlug = town.toLowerCase().replace(/\s+/g, "-");
      xml += urlEntry(`${baseUrl}/breeders/${breedSlug}/${townSlug}`, "0.6", "weekly", today);
    }
  }

  // Town index pages
  for (const town of uniqueTowns) {
    const townSlug = town.toLowerCase().replace(/\s+/g, "-");
    xml += urlEntry(`${baseUrl}/breeders/location/${townSlug}`, "0.7", "weekly", today);
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
