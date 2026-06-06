import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SearchResults from "@components/SearchResults";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata({ params }) {
  const locationName = params.town.replace(/-/g, " ");
  const title = `Dog breeders in ${locationName}`;
  const description = `Compare dog breeder listings in ${locationName}. Browse public information, ratings, and contact details before making contact. BreedWise is a directory only.`;
  return baseMetadata({
    title,
    description,
    path: `/${params.country}/${params.region}/${params.county}/${params.town}/dog-breeders`,
  });
}

export default async function LocationPage({ params }) {
  const locationName = params.town.replace(/-/g, " ");
  const supabase = createClient();

  const { data: breeders, error } = await supabase
    .from("breeders")
    .select("*, breeder_breeds(breed)")
    .ilike("town", locationName)
    .in("status", ["public_listing", "claimed_profile"]);

  if (error) return notFound();

  const results = (breeders || []).map((b) => ({
    ...b,
    breeds: b.breeder_breeds?.map((bb) => bb.breed) || [],
    breeder_breeds: undefined,
    distance: null,
  }));

  if (results.length === 0) return notFound();

  const structuredData = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: "Search", url: "https://breedwise.co.uk/search" },
    { name: locationName, url: `https://breedwise.co.uk/${params.country}/${params.region}/${params.county}/${params.town}/dog-breeders` },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Location directory</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Dog breeders in {locationName}</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Browse public dog breeder listings in {locationName}. Compare contact details, ratings, and breeds before making your own enquiries. BreedWise is a directory only — we do not endorse or vet breeders.
        </p>
      </div>

      <div className="mt-8">
        <SearchResults breeders={results} query={locationName} breed="" />
      </div>
    </div>
  );
}
