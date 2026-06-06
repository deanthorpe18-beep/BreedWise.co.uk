import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBreeds } from "@lib/breeders";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata({ params }) {
  const breedName = params.slug.replace(/-/g, " ");
  const locationName = params.subSlug.replace(/-/g, " ");
  const title = `${breedName} breeders in ${locationName}`;
  const description = `Compare ${breedName} breeder listings in ${locationName}. Browse public information before making contact. BreedWise is a directory only.`;
  return baseMetadata({
    title,
    description,
    path: `/breeders/${params.slug}/${params.subSlug}`,
  });
}

export default async function BreedLocationPage({ params }) {
  const breedName = params.slug.replace(/-/g, " ");
  const locationName = params.subSlug.replace(/-/g, " ");

  // Validate breed exists
  const breedList = getBreeds();
  const isValidBreed = breedList.some((b) => b.toLowerCase() === breedName.toLowerCase());
  if (!isValidBreed) return notFound();

  const supabase = createClient();

  const { data: breeders, error } = await supabase
    .from("breeders")
    .select("*, breeder_breeds(breed)")
    .ilike("town", locationName)
    .in("status", ["public_listing", "claimed_profile"]);

  if (error) return notFound();

  const matched = (breeders || []).filter((b) =>
    b.breeder_breeds?.some((bb) => bb.breed.toLowerCase() === breedName.toLowerCase())
  ).map((b) => ({
    ...b,
    breeds: b.breeder_breeds?.map((bb) => bb.breed) || [],
    breeder_breeds: undefined,
  }));

  if (matched.length === 0) return notFound();

  const structuredData = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: "Breeds", url: "https://breedwise.co.uk/search" },
    { name: breedName, url: `https://breedwise.co.uk/breeders/${params.slug}` },
    { name: locationName, url: `https://breedwise.co.uk/breeders/${params.slug}/${params.subSlug}` },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Breed + location</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{breedName} breeders in {locationName}</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Browse public {breedName} breeder listings in {locationName}. Compare contact details and ratings before making your own enquiries. BreedWise is a directory only — we do not endorse or vet breeders.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matched.map((breeder) => (
          <Link
            key={breeder.slug}
            href={`/breeder/${breeder.slug}`}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-900">{breeder.name}</p>
            <p className="mt-1 text-sm text-slate-500">{breeder.town}{breeder.county ? `, ${breeder.county}` : ""}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              {breeder.google_rating ? (
                <span className="rounded-full bg-slate-100 px-3 py-1">{breeder.google_rating} ★</span>
              ) : null}
              {breeder.breeds?.slice(0, 2).map((b) => (
                <span key={b} className="rounded-full bg-slate-100 px-3 py-1">{b}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/breeders/${params.slug}`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:text-[#00BFA5]"
        >
          All {breedName} breeders
        </Link>
        <Link
          href={`/breeders/${params.subSlug}`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:text-[#00BFA5]"
        >
          All breeders in {locationName}
        </Link>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-[#00BFA5] flex-shrink-0" />
            <p>BreedWise is a directory only. We do not sell puppies.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-[#00BFA5] flex-shrink-0" />
            <p>Inclusion does not equal endorsement, vetting, or recommendation.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-[#00BFA5] flex-shrink-0" />
            <p>Always do your own checks before contacting any breeder.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-[#00BFA5] flex-shrink-0" />
            <p>Breeders can claim listings to improve accuracy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
