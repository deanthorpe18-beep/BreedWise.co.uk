import Link from "next/link";
import SearchForm from "@components/SearchForm";
import { getBreeds } from "@lib/breeders";

export default function HomePage() {
  const featuredBreeds = [
    "Labrador Retriever",
    "Golden Retriever",
    "French Bulldog",
    "Border Collie"
  ];
  const breeds = getBreeds().slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <section className="space-y-6 pb-8">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex rounded-full bg-[#00BFA5]/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-[#00BFA5]">UK Dog Breeder Directory</span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Find trusted dog breeders in West Sussex and across the UK.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            BreedWise is a clean, mobile-first directory for UK dog breeders. Search by town or postcode, filter by breed, compare ratings, and contact breeders directly.
          </p>
        </div>

        <SearchForm />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Search made simple</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5 hover:bg-[#E6FFFB] transition cursor-pointer" title="Search breeders by entering a town or postcode in the search box above.">
              <p className="text-sm font-semibold text-slate-700">Browse by location</p>
              <p className="mt-2 text-sm text-slate-500">Start with town or postcode and expand across the UK later.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5 hover:bg-[#E6FFFB] transition cursor-pointer" title="Use the breed dropdown in the search form to filter results to specific dog breeds.">
              <p className="text-sm font-semibold text-slate-700">Filter by breed</p>
              <p className="mt-2 text-sm text-slate-500">Choose from over 30 popular UK breeds, including Labradors, Cockapoos and more.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5 hover:bg-[#E6FFFB] transition cursor-pointer" title="Compare breeders side-by-side using the list view to see ratings, contact info, and kennel club details.">
              <p className="text-sm font-semibold text-slate-700">Compare quickly</p>
              <p className="mt-2 text-sm text-slate-500">Review Google ratings, contact options, and public credibility details at a glance.</p>
            </div>
            <Link href="/claim" className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5 hover:bg-[#E6FFFB] transition cursor-pointer block">
              <p className="text-sm font-semibold text-slate-700">Claim listings</p>
              <p className="mt-2 text-sm text-slate-500">Breeders can submit a claim and request approval to update their profile.</p>
            </Link>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Popular breeds</h3>
            <p className="mt-2 text-sm text-slate-500">Quick jump links to the most requested UK breeds.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {breeds.map((breedName) => (
              <Link
                key={breedName}
                href={`/search?breed=${encodeURIComponent(breedName)}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:bg-white"
              >
                {breedName}
              </Link>
            ))}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5">
            <p className="text-sm font-semibold text-slate-700">West Sussex towns</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              {[
                "Chichester",
                "Worthing",
                "Crawley",
                "Horsham",
                "Haywards Heath",
                "Bognor Regis"
              ].map((town) => (
                <Link key={town} href={`/england/west-sussex/${slugify(town)}/dog-breeders`} className="rounded-2xl bg-white px-3 py-2 text-slate-700 hover:bg-[#E6FFFB] transition">
                  {town}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function slugify(text) {
  return text.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
