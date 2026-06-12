import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import SearchResults from "@components/SearchResults";
import PageViewTracker from "@components/PageViewTracker";
import SearchForm from "@components/SearchForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const breedName = params.breed.replace(/-/g, " ");
  const locationName = params.location.replace(/-/g, " ");
  const title = `${breedName} breeders in ${locationName}`;
  const description = `Find ${breedName} breeders in ${locationName}. Compare public listings, read reviews, and contact breeders directly through BreedWise.`;

  return baseMetadata({
    title,
    description,
    path: `/breeders/${params.breed}/${params.location}`,
  });
}

export default async function BreedLocationPage({ params }) {
  const breedName = params.breed.replace(/-/g, " ");
  const locationName = params.location.replace(/-/g, " ");

  const adminClient = createAdminClient();

  // Validate breed exists
  const { data: breedRow } = await adminClient
    .from("breeds")
    .select("name")
    .ilike("name", breedName)
    .maybeSingle();

  if (!breedRow) {
    notFound();
  }

  const canonicalBreedName = breedRow.name;

  // Fetch breeders in this location
  const { data: breeders, error } = await adminClient
    .from("breeders")
    .select("*, breeder_breeds(breed), breeder_photos(*)")
    .ilike("town", `%${locationName}%`)
    .in("status", ["public_listing", "claimed_profile"]);

  if (error) {
    notFound();
  }

  // Filter to breeders that have this breed
  const matched = (breeders || []).filter((b) =>
    b.breeder_breeds?.some((bb) => bb.breed.toLowerCase() === canonicalBreedName.toLowerCase())
  ).map((b) => ({
    ...b,
    breeds: b.breeder_breeds?.map((bb) => bb.breed) || [],
    breeder_breeds: undefined,
    distance: null,
  }));

  if (matched.length === 0) {
    notFound();
  }

  const structuredData = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: canonicalBreedName, url: `https://breedwise.co.uk/breeders/${encodeURIComponent(canonicalBreedName)}` },
    { name: locationName, url: `https://breedwise.co.uk/breeders/${params.breed}/${params.location}` },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
      <PageViewTracker page={`breeders/${params.breed}/${params.location}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Header */}
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Breeders in {locationName}</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          {canonicalBreedName} breeders in {locationName}
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          {matched.length} {canonicalBreedName} breeder{matched.length !== 1 ? "s" : ""} found in {locationName}. Compare public listings before making contact.
        </p>
      </div>

      {/* Search form */}
      <div className="mt-8">
        <SearchForm
          initialLocation={locationName}
          initialBreed={canonicalBreedName}
        />
      </div>

      {/* Results */}
      <div className="mt-8">
        <SearchResults
          breeders={matched}
          query={locationName}
          breed={canonicalBreedName}
          totalCount={matched.length}
          currentPage={1}
          totalPages={1}
        />
      </div>

      {/* Educational context */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">About {canonicalBreedName}s in {locationName}</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          These listings show {canonicalBreedName} breeders based in or near {locationName}. 
          BreedWise is a directory only — we do not vet breeders. Always do your own research, 
          ask questions, and verify health testing before making contact. Read our{" "}
          <a href="/guides" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">buyer guides</a>{" "}
          for tips on what to ask and what to look for.
        </p>
      </div>
    </div>
  );
}
