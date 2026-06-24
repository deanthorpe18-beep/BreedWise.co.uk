import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function townSlug(town) {
  return town.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export async function GET() {
  const baseUrl = "https://breedwise.co.uk";
  const today = new Date().toISOString().split("T")[0];
  const supabase = createAdminClient();

  const staticPaths = [
    "",
    "/about",
    "/search",
    "/near-me",
    "/breeds",
    "/claim",
    "/breeder-benefits",
    "/education",
    "/guides",
    "/guides/find-reputable-breeder",
    "/guides/puppy-viewing-checklist",
    "/guides/puppy-contract-guide",
    "/guides/transporting-your-puppy",
    "/guides/puppy-socialisation",
    "/tools/breeder-checklist",
    "/tools/puppy-cost-calculator",
    "/privacy",
    "/terms",
    "/disclaimer",
    "/editorial-policy",
    "/listing-policy",
    "/data-sources",
    "/corrections-removals",
    "/education/choosing-a-breeder",
    "/education/what-to-ask",
    "/education/red-flags",
    "/education/how-to-compare",
    "/education/health-testing",
    "/education/how-to-use-safely",
  ];

  const [{ data: breeders }, { data: breeds }, { data: locations }] = await Promise.all([
    supabase.from("breeders").select("slug, last_updated_at").in("status", ["public_listing", "claimed_profile"]),
    supabase.from("breeds").select("name, slug, animal_type, is_popular").not("slug", "is", null),
    supabase.from("breeders").select("town, county").in("status", ["public_listing", "claimed_profile"]),
  ]);

  const uniqueTowns = [...new Set((locations || []).map((l) => l.town).filter(Boolean))];
  const topTowns = uniqueTowns.slice(0, 50);

  const topDogBreeds = (breeds || []).filter((b) => b.is_popular && b.animal_type === "dog" && b.slug).slice(0, 25);
  const topCatBreeds = (breeds || []).filter((b) => b.is_popular && b.animal_type === "cat" && b.slug);
  const topBreeds = [...topDogBreeds, ...topCatBreeds];

  const breedCombos = [];
  for (const breed of topBreeds) {
    for (const town of topTowns) {
      breedCombos.push({
        loc: `${baseUrl}/breeders/${breed.slug}/${townSlug(town)}`,
        lastmod: today,
        changefreq: "weekly",
        priority: breed.animal_type === "cat" ? "0.72" : "0.75",
      });
    }
  }

  const urls = [
    ...staticPaths.map((path) => ({
      loc: `${baseUrl}${path}`,
      lastmod: today,
      changefreq: path === "" ? "daily" : path === "/about" ? "monthly" : "weekly",
      priority: path === "" ? "1.0" : path === "/about" ? "0.9" : "0.8",
    })),
    ...(breeders || []).map((b) => ({
      loc: `${baseUrl}/breeder/${b.slug}`,
      lastmod: b.last_updated_at ? new Date(b.last_updated_at).toISOString().split("T")[0] : today,
      changefreq: "weekly",
      priority: "0.9",
    })),
    ...(breeds || []).filter((b) => b.slug).map((b) => ({
      loc: `${baseUrl}/breeders/${b.slug}`,
      lastmod: today,
      changefreq: "weekly",
      priority: b.is_popular ? "0.82" : "0.75",
    })),
    ...(breeds || []).filter((b) => b.slug).map((b) => ({
      loc: `${baseUrl}/breeds/${b.slug}`,
      lastmod: today,
      changefreq: "weekly",
      priority: b.is_popular ? "0.85" : "0.7",
    })),
    ...uniqueTowns.map((town) => ({
      loc: `${baseUrl}/breeders/location/${townSlug(town)}`,
      lastmod: today,
      changefreq: "weekly",
      priority: "0.7",
    })),
    ...breedCombos,
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
