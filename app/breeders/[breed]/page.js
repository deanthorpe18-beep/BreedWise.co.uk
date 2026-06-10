import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBreeds, slugify } from "@lib/breeders";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  const breeds = getBreeds();
  return breeds.map((breed) => ({ breed: slugify(breed) }));
}

export function generateMetadata({ params }) {
  const breedName = params.breed.replace(/-/g, " ");
  return baseMetadata({
    title: `${breedName} breeders UK`,
    description: `Compare ${breedName} breeder listings across the UK. Browse public information before making contact. BreedWise is a directory only — we do not sell puppies or endorse breeders.`,
    path: `/breeders/${params.breed}`,
  });
}

const TIER_RANK = {
  gold: 5,
  silver: 4,
  bronze: 3,
  free: 2,
  unclaimed: 1,
};

export default async function BreedPage({ params }) {
  const breedName = params.breed.replace(/-/g, " ");

  const breedList = getBreeds();
  const isValidBreed = breedList.some(
    (b) => b.toLowerCase() === breedName.toLowerCase()
  );
  if (!isValidBreed) return notFound();

  const supabase = createClient();

  const { data: breeders, error } = await supabase
    .from("breeders")
    .select("*, breeder_breeds(breed)")
    .in("status", ["public_listing", "claimed_profile"]);

  if (error) return notFound();

  const breedBreeders = (breeders || [])
    .filter((b) =>
      b.breeder_breeds?.some(
        (bb) => bb.breed.toLowerCase() === breedName.toLowerCase()
      )
    )
    .map((b) => ({
      ...b,
      breeds: b.breeder_breeds?.map((bb) => bb.breed) || [],
      breeder_breeds: undefined,
    }))
    .sort((a, b) => {
      const rankA = TIER_RANK[a.membership_tier] || 0;
      const rankB = TIER_RANK[b.membership_tier] || 0;
      if (rankA !== rankB) return rankB - rankA;
      return (a.name || "").localeCompare(b.name || "");
    });

  if (breedBreeders.length === 0) return notFound();

  const uniqueTowns = [
    ...new Set(breedBreeders.map((b) => b.town).filter(Boolean)),
  ].slice(0, 8);

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: "Breeds", url: "https://breedwise.co.uk/search" },
    {
      name: breedName,
      url: `https://breedwise.co.uk/breeders/${params.breed}`,
    },
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: breedBreeders.map((breeder, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://breedwise.co.uk/breeder/${breeder.slug}`,
      name: breeder.name,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">
          Breed directory
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          {breedName} breeder listings
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Browse public {breedName} breeder information across the UK. Compare
          contact details, ratings, and locations before making your own
          enquiries. BreedWise is a directory only — we do not endorse or vet
          breeders.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {breedBreeders.map((breeder) => (
          <Link
            key={breeder.slug}
            href={`/breeder/${breeder.slug}`}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-900">
              {breeder.name}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {breeder.town}
              {breeder.county ? `, ${breeder.county}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              {breeder.google_rating ? (
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {breeder.google_rating} ★
                </span>
              ) : null}
              {breeder.breeds?.slice(0, 2).map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-slate-100 px-3 py-1"
                >
                  {b}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">
          Popular locations for {breedName}s
        </p>
        <div className="flex flex-wrap gap-2">
          {uniqueTowns.map((town) => (
            <Link
              key={town}
              href={`/breeders/${params.breed}/${slugify(town)}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:text-[#00BFA5]"
            >
              {town}
            </Link>
          ))}
        </div>
      </div>

      <TrustStrip />
    </div>
  );
}

function TrustStrip() {
  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
      <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#00BFA5]" />
          <p>BreedWise is a directory only. We do not sell puppies.</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#00BFA5]" />
          <p>Inclusion does not equal endorsement, vetting, or recommendation.</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#00BFA5]" />
          <p>Always do your own checks before contacting any breeder.</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#00BFA5]" />
          <p>Breeders can claim listings to improve accuracy.</p>
        </div>
      </div>
    </div>
  );
}
