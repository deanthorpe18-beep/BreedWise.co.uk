import SearchResults from "@components/SearchResults";
import SearchForm from "@components/SearchForm";
import PageViewTracker from "@components/PageViewTracker";
import { enrichWithDistance, searchBreeders } from "@lib/breeders";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ searchParams }) {
  const query = searchParams?.q || "";
  const breed = searchParams?.breed || "";
  let title = "Search breeders";
  if (breed && query) title = `${breed} breeders in ${query}`;
  else if (breed) title = `${breed} breeders`;
  else if (query) title = `Dog breeders in ${query}`;
  return baseMetadata({
    title,
    description: "Search dog breeder listings across the UK. Compare public information before making contact.",
    path: `/search?q=${encodeURIComponent(query)}&breed=${encodeURIComponent(breed)}`,
  });
}

export default function SearchPage({ searchParams }) {
  const query = searchParams?.q || "";
  const breed = searchParams?.breed || "";
  const results = enrichWithDistance(searchBreeders(query, breed), query || "West Sussex");

  return (
    <>
      <PageViewTracker page="search" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Search breeders</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Find breeders by town, postcode, or breed</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Browse public breeder listings in West Sussex and beyond. Compare available information before reaching out. BreedWise does not endorse or vet breeders.
          </p>
        </div>

        <div className="mt-8">
          <SearchForm initialLocation={query} initialBreed={breed} />
        </div>

        <div className="mt-8">
          <SearchResults breeders={results} query={query} breed={breed} />
        </div>

        {/* Educational content block */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Before you contact a breeder</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-[#F1F4F6] p-4">
              <p className="font-semibold text-slate-900">Do your own checks</p>
              <p className="mt-1">Verify licences, health tests, and references independently.</p>
            </div>
            <div className="rounded-2xl bg-[#F1F4F6] p-4">
              <p className="font-semibold text-slate-900">Ask the right questions</p>
              <p className="mt-1">See our guide on what to ask before making contact.</p>
            </div>
            <div className="rounded-2xl bg-[#F1F4F6] p-4">
              <p className="font-semibold text-slate-900">Watch for red flags</p>
              <p className="mt-1">Learn the warning signs to protect yourself and your family.</p>
            </div>
          </div>
          <div className="mt-4">
            <a href="/education" className="text-sm font-semibold text-[#00BFA5] hover:text-[#008f7a]">Explore buyer guides →</a>
          </div>
        </div>
      </div>
    </>
  );
}
