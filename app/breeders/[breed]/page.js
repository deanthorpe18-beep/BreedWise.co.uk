import Link from "next/link";
import { notFound } from "next/navigation";
import { getBreeds, getAllBreeders } from "@lib/breeders";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export function generateStaticParams() {
  const breeds = getBreeds();
  return breeds.map((breed) => ({
    breed: breed.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export function generateMetadata({ params }) {
  const breedName = params.breed.replace(/-/g, " ");
  const title = `${breedName} breeders UK`;
  const description = `Compare ${breedName} breeder listings across the UK. Browse public information before making contact. BreedWise is a directory only — we do not sell puppies or endorse breeders.`;
  return baseMetadata({
    title,
    description,
    path: `/breeders/${params.breed}`,
  });
}

export default function BreedPage({ params }) {
  const breedName = params.breed.replace(/-/g, " ");
  const allBreeders = getAllBreeders();
  const breeders = allBreeders.filter((b) =>
    b.breeds.some((br) => br.name.toLowerCase() === breedName.toLowerCase())
  );

  if (!breeders.length) return notFound();

  const uniqueTowns = [...new Set(breeders.map((b) => b.town.value))].slice(0, 8);

  const structuredData = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: "Breeds", url: "https://breedwise.co.uk/search" },
    { name: breedName, url: `https://breedwise.co.uk/breeders/${params.breed}` },
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
