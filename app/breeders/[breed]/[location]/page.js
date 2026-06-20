import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import SearchResults from "@components/SearchResults";
import PageViewTracker from "@components/PageViewTracker";
import SearchForm from "@components/SearchForm";
import SaveSearchAlert from "@components/SaveSearchAlert";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const locationName = params.location.replace(/-/g, " ");
  const breedSlug = params.breed;
  const title = `Pet breeders in ${locationName}`;
  const description = `Find pet and ${breedSlug.replace(/-/g, " ")} breeders in ${locationName}. Compare listings, licences, and reviews on BreedWise before making contact.`;

  return baseMetadata({
    title,
    description,
    path: `/breeders/${params.breed}/${params.location}`,
  });
}

export default async function BreedLocationPage({ params }) {
  const locationName = params.location.replace(/-/g, " ");
  const breedSlug = params.breed;

  const adminClient = createAdminClient();

  let breedRow = null;
  const { data: bySlug } = await adminClient
    .from("breeds")
    .select("name, slug, description, image_url, temperament, animal_type")
    .eq("slug", breedSlug)
    .maybeSingle();
  breedRow = bySlug;

  if (!breedRow) {
    const fallbackName = breedSlug.replace(/-/g, " ");
    const { data: byName } = await adminClient
      .from("breeds")
      .select("name, slug, description, image_url, temperament, animal_type")
      .ilike("name", fallbackName)
      .maybeSingle();
    if (!byName) notFound();
    breedRow = byName;
  }

  const canonicalBreedName = breedRow.name;

  const { data: breeders, error } = await adminClient
    .from("breeders")
    .select("*, breeder_breeds(breed, animal_type), breeder_photos(*)")
    .or(`town.ilike.%${locationName}%,county.ilike.%${locationName}%`)
    .in("status", ["public_listing", "claimed_profile"]);

  if (error) notFound();

  const matched = (breeders || [])
    .filter((b) =>
      b.breeder_breeds?.some((bb) => bb.breed.toLowerCase() === canonicalBreedName.toLowerCase())
    )
    .map((b) => ({
      ...b,
      breeds: b.breeder_breeds?.map((bb) => bb.breed) || [],
      breeder_breeds: undefined,
      distance: null,
    }));

  const structuredData = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: canonicalBreedName, url: `https://breedwise.co.uk/breeds/${breedRow.slug || breedSlug}` },
    { name: locationName, url: `https://breedwise.co.uk/breeders/${breedSlug}/${params.location}` },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
      <PageViewTracker page={`breeders/${breedSlug}/${params.location}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E6FFFB] via-white to-[#FFF5F0] p-8 border border-[#00BFA5]/10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] items-start">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Breeders in {locationName}</p>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              {canonicalBreedName} breeders in {locationName}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              {matched.length > 0
                ? `${matched.length} ${canonicalBreedName} breeder${matched.length !== 1 ? "s" : ""} in or near ${locationName}. Compare licences, reviews, and availability before you contact anyone.`
                : `No ${canonicalBreedName} breeders listed in ${locationName} yet — create an alert or search nearby.`}
            </p>
          </div>
          {breedRow.image_url && (
            <img
              src={breedRow.image_url}
              alt={canonicalBreedName}
              className="hidden lg:block w-40 h-40 rounded-2xl object-cover shadow-md"
            />
          )}
        </div>
      </div>

      <div className="mt-8">
        <SearchForm initialLocation={locationName} initialBreeds={[canonicalBreedName]} />
      </div>

      <div className="mt-6">
        <SaveSearchAlert query={locationName} breed={canonicalBreedName} hasResults={matched.length > 0} />
      </div>

      {matched.length > 0 ? (
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
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-900">No listings in {locationName} yet</p>
          <p className="mt-2 text-sm text-slate-500">Try a nearby town or set an alert above — we&apos;ll email you when breeders are added.</p>
          <Link href={`/search?breed=${encodeURIComponent(canonicalBreedName)}`} className="mt-4 inline-block text-sm font-bold text-[#00BFA5] hover:text-[#008f7a]">
            Search all {canonicalBreedName} breeders →
          </Link>
        </div>
      )}

      {breedRow.description && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[#00BFA5]">About {canonicalBreedName}s</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{breedRow.description.slice(0, 400)}{breedRow.description.length > 400 ? "…" : ""}</p>
          {breedRow.temperament && (
            <p className="mt-3 text-sm text-slate-600"><strong>Temperament:</strong> {breedRow.temperament}</p>
          )}
          <Link href={`/breeds/${breedRow.slug || breedSlug}`} className="mt-4 inline-block text-sm font-semibold text-[#00BFA5]">
            Read full breed guide →
          </Link>
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Before you contact a breeder</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          BreedWise is a directory only — we do not vet breeders. Always verify council licences, health tests, and visit in person.{" "}
          <Link href="/education/red-flags" className="font-semibold text-[#00BFA5]">Red flags guide</Link>
          {" · "}
          <Link href="/guides/puppy-viewing-checklist" className="font-semibold text-[#00BFA5]">Viewing checklist</Link>
        </p>
      </div>
    </div>
  );
}
