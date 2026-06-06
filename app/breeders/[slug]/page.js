import Link from "next/link";
import { notFound } from "next/navigation";
import { getBreeds, getAllBreeders, getLocationParams } from "@lib/breeders";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export function generateStaticParams() {
  const breeds = getBreeds().map((breed) => ({
    slug: breed.toLowerCase().replace(/\s+/g, "-"),
  }));
  const locations = getLocationParams().map((loc) => ({
    slug: loc.town,
  }));
  return [...breeds, ...locations];
}

export function generateMetadata({ params }) {
  const slugName = params.slug.replace(/-/g, " ");
  const allBreeders = getAllBreeders();

  const isBreed = allBreeders.some((b) =>
    b.breeds.some((br) => br.name.toLowerCase() === slugName.toLowerCase())
  );

  if (isBreed) {
    return baseMetadata({
      title: `${slugName} breeders UK`,
      description: `Compare ${slugName} breeder listings across the UK. Browse public information before making contact. BreedWise is a directory only — we do not sell puppies or endorse breeders.`,
      path: `/breeders/${params.slug}`,
    });
  }

  return baseMetadata({
    title: `Dog breeders in ${slugName}`,
    description: `Compare dog breeder listings in ${slugName}. Browse public information, ratings, and contact details before making contact. BreedWise is a directory only.`,
    path: `/breeders/${params.slug}`,
  });
}

export default function BreedersSlugPage({ params }) {
  const slugName = params.slug.replace(/-/g, " ");
  const allBreeders = getAllBreeders();

  const breedBreeders = allBreeders.filter((b) =>
    b.breeds.some((br) => br.name.toLowerCase() === slugName.toLowerCase())
  );

  if (breedBreeders.length > 0) {
    return <BreedPage breedName={slugName} breeders={breedBreeders} slug={params.slug} />;
  }

  const locationBreeders = allBreeders.filter(
    (b) => b.town.value.toLowerCase() === slugName.toLowerCase()
  );

  if (locationBreeders.length > 0) {
    return <LocationPage locationName={slugName} breeders={locationBreeders} slug={params.slug} />;
  }

  return notFound();
}

function BreedPage({ breedName, breeders, slug }) {
  const uniqueTowns = [...new Set(breeders.map((b) => b.town.value))].slice(0, 8);

  const structuredData = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: "Breeds", url: "https://breedwise.co.uk/search" },
    { name: breedName, url: `https://breedwise.co.uk/breeders/${slug}` },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Breed directory</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{breedName} breeder listings</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Browse public {breedName} breeder information across the UK. Compare contact details, ratings, and locations before making your own enquiries. BreedWise is a directory only — we do not endorse or vet breeders.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {breeders.map((breeder) => (
          <Link
            key={breeder.slug}
            href={`/breeder/${breeder.slug}`}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-900">{breeder.name.value}</p>
            <p className="mt-1 text-sm text-slate-500">{breeder.town.value}, {breeder.county.value}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">{breeder.google_rating.value} ★</span>
              {breeder.breeds.slice(0, 2).map((b) => (
                <span key={b.name} className="rounded-full bg-slate-100 px-3 py-1">{b.name}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Popular locations for {breedName}s</p>
        <div className="flex flex-wrap gap-2">
          {uniqueTowns.map((town) => (
            <Link
              key={town}
              href={`/search?q=${encodeURIComponent(town)}&breed=${encodeURIComponent(breedName)}`}
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

function LocationPage({ locationName, breeders, slug }) {
  const breedsInLocation = [...new Set(breeders.flatMap((b) => b.breeds.map((br) => br.name)))].slice(0, 10);

  const structuredData = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: "Locations", url: "https://breedwise.co.uk/search" },
    { name: locationName, url: `https://breedwise.co.uk/breeders/${slug}` },
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {breeders.map((breeder) => (
          <Link
            key={breeder.slug}
            href={`/breeder/${breeder.slug}`}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-900">{breeder.name.value}</p>
            <p className="mt-1 text-sm text-slate-500">{breeder.town.value}, {breeder.county.value}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">{breeder.google_rating.value} ★</span>
              {breeder.breeds.slice(0, 2).map((b) => (
                <span key={b.name} className="rounded-full bg-slate-100 px-3 py-1">{b.name}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Popular breeds in {locationName}</p>
        <div className="flex flex-wrap gap-2">
          {breedsInLocation.map((breed) => (
            <Link
              key={breed}
              href={`/search?q=${encodeURIComponent(locationName)}&breed=${encodeURIComponent(breed)}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:text-[#00BFA5]"
            >
              {breed}
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
  );
}
