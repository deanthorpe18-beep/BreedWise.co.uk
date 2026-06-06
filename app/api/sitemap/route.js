import { NextResponse } from "next/server";
import { getAllBreeders, getBreeds, getLocationParams } from "@lib/breeders";

export async function GET() {
  const baseUrl = "https://breedwise.co.uk";
  const breeders = getAllBreeders();
  const breeds = getBreeds();
  const locations = getLocationParams();

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

  for (const breeder of breeders) {
    xml += `  <url>\n    <loc>${baseUrl}/breeder/${breeder.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  for (const loc of locations) {
    xml += `  <url>\n    <loc>${baseUrl}/${loc.country}/${loc.region}/${loc.county}/${loc.town}/dog-breeders</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    for (const breed of breeds) {
      const breedSlug = breed.toLowerCase().replace(/\s+/g, "-");
      xml += `  <url>\n    <loc>${baseUrl}/${loc.country}/${loc.region}/${loc.county}/${loc.town}/${breedSlug}-breeders</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }
  }

  for (const breed of breeds) {
    const breedSlug = breed.toLowerCase().replace(/\s+/g, "-");
    xml += `  <url>\n    <loc>${baseUrl}/breeders/${breedSlug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    for (const loc of locations) {
      xml += `  <url>\n    <loc>${baseUrl}/breeders/${breedSlug}/${loc.town}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }
  }

  for (const loc of locations) {
    xml += `  <url>\n    <loc>${baseUrl}/breeders/${loc.town}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
