import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = "https://breedwise.co.uk";
  const supabase = createAdminClient();

  const staticPaths = [
    "", "/search", "/claim", "/education", "/guides", "/near-me",
    "/breeder-benefits", "/privacy", "/terms", "/disclaimer",
    "/education/what-to-ask", "/education/red-flags",
    "/education/how-to-compare", "/education/health-testing",
    "/education/how-to-use-safely", "/education/choosing-a-breeder",
    "/guides/puppy-viewing-checklist", "/guides/puppy-contract-guide",
    "/guides/transporting-your-puppy", "/guides/puppy-socialisation",
  ];

  const [{ data: breeders }, { data: breeds }, { data: locations }] = await Promise.all([
    supabase.from("breeders").select("slug, last_updated_at").in("status", ["public_listing", "claimed_profile"]),
    supabase.from("breeds").select("name, slug, is_popular"),
    supabase.from("breeders").select("town, county").in("status", ["public_listing", "claimed_profile"]),
  ]);

  const uniqueTowns = [...new Set((locations || []).map((l) => l.town).filter(Boolean))];

  const urls = [
    ...staticPaths.map((path) => ({
      loc: `${baseUrl}${path}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: path === "" ? "daily" : "weekly",
      priority: path === "" ? "1.0" : "0.8",
    })),
    ...(breeders || []).map((b) => ({
      loc: `${baseUrl}/breeder/${b.slug}`,
      lastmod: b.last_updated_at ? new Date(b.last_updated_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "0.9",
    })),
    ...(breeds || []).map((b) => ({
      loc: `${baseUrl}/breeders/${encodeURIComponent(b.name)}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "0.8",
    })),
    ...(breeds || []).filter((b) => b.slug).map((b) => ({
      loc: `${baseUrl}/breeds/${b.slug}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: b.is_popular ? "0.85" : "0.7",
    })),
    ...uniqueTowns.map((town) => ({
      loc: `${baseUrl}/breeders/location/${encodeURIComponent(town)}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "0.7",
    })),
    // Top breed + location combos for SEO landing pages
    ...(function () {
      const topBreeds = (breeds || []).filter((b) => b.is_popular).slice(0, 15);
      const topTowns = uniqueTowns.slice(0, 30);
      const combos = [];
      for (const breed of topBreeds) {
        if (!breed.slug) continue;
        for (const town of topTowns) {
          const townSlug = town.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          combos.push({
            loc: `${baseUrl}/breeders/${breed.slug}/${townSlug}`,
            lastmod: new Date().toISOString().split("T")[0],
            changefreq: "weekly",
            priority: "0.75",
          });
        }
      }
      return combos;
    })(),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
