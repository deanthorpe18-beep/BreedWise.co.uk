import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBreeds } from "@lib/breeders";

export async function GET() {
  const baseUrl = "https://breedwise.co.uk";

  const supabase = createClient();

  // Fetch real breeder slugs from Supabase
  const { data: breeders, error } = await supabase
    .from("breeders")
    .select("slug, town")
    .in("status", ["public_listing", "claimed_profile"]);

  if (error) {
    console.error("Sitemap: failed to fetch breeders:", error.message);
  }

  const breeds = getBreeds();

  // Get unique towns from real breeders
  const uniqueTowns = [...new Set((breeders || []).map((b) => b.town).filter(Boolean))];

  const staticPaths = [
    "",
    "/search",
    "/claim",
    "/request-removal",
    "/suggest-edit",
    "/breeder-benefits",
    "/education",
    "/privacy",
    "/terms",
    "/disclaimer",
    "/editorial-policy",
    "/listing-policy",
    "/data-sources",
    "/corrections-removals",
    "/auth/login",
    "/auth/signup",
  ];

  const educationPaths = ["what-to-ask", "red-flags", "how-to-compare", "health-testing", "how-to-use-safely"];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const path of staticPaths) {
    xml += `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${path === "" ? "1.0" : "0.7"}</priority>\n  </url>\n`;
  }

  for (const slug of educationPaths) {
    xml += `  <url>\n    <loc>${baseUrl}/education/${slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  }

  // Real breeder pages
  for (const breeder of breeders || []) {
    xml += `  <url>\n    <loc>${baseUrl}/breeder/${breeder.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // Town pages (from real data)
  for (const town of uniqueTowns) {
    const townSlug = town.toLowerCase().replace(/\s+/g, "-");
    xml += `  <url>\n    <loc>${baseUrl}/england/west-sussex/west-sussex/${townSlug}/dog-breeders</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    for (const breed of breeds) {
      const breedSlug = breed.toLowerCase().replace(/\s+/g, "-");
      xml += `  <url>\n    <loc>${baseUrl}/england/west-sussex/west-sussex/${townSlug}/${breedSlug}-breeders</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }
  }

  // Breed pages
  for (const breed of breeds) {
    const breedSlug = breed.toLowerCase().replace(/\s+/g, "-");
    xml += `  <url>\n    <loc>${baseUrl}/breeders/${breedSlug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    for (const town of uniqueTowns) {
      const townSlug = town.toLowerCase().replace(/\s+/g, "-");
      xml += `  <url>\n    <loc>${baseUrl}/breeders/${breedSlug}/${townSlug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }
  }

  // Town index pages
  for (const town of uniqueTowns) {
    const townSlug = town.toLowerCase().replace(/\s+/g, "-");
    xml += `  <url>\n    <loc>${baseUrl}/breeders/${townSlug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
