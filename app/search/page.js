import SearchResults from "@components/SearchResults";
import SearchForm from "@components/SearchForm";
import PageViewTracker from "@components/PageViewTracker";
import SearchAnalyticsTracker from "@components/SearchAnalyticsTracker";
import RecentSearches from "@components/RecentSearches";
import Breadcrumbs from "@components/Breadcrumbs";
import { searchBreeders } from "@/lib/search";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { MapPin, SearchX, PawPrint } from "lucide-react";

export function generateMetadata({ searchParams }) {
  const query = searchParams?.q || "";
  const breeds = searchParams?.breed ? (Array.isArray(searchParams.breed) ? searchParams.breed : [searchParams.breed]) : [];
  const animal = searchParams?.animal || "";
  const breedLabel = breeds.length === 1 ? breeds[0] : breeds.length > 1 ? `${breeds.length} breeds` : "";
  const animalLabel = animal ? `${animal.charAt(0).toUpperCase() + animal.slice(1)}` : "Pet";

  let title = "Search breeders";
  if (breedLabel && query) title = `${breedLabel} breeders in ${query}`;
  else if (breedLabel) title = `${breedLabel} breeders`;
  else if (query) title = `${animalLabel} breeders in ${query}`;
  else if (animal) title = `${animalLabel} breeders`;

  return baseMetadata({
    title,
    description: `Search ${animalLabel.toLowerCase()} breeder listings across the UK. Compare public information before making contact.`,
    path: `/search?q=${encodeURIComponent(query)}&animal=${encodeURIComponent(animal)}`,
  });
}

export default async function SearchPage({ searchParams }) {
  const query = searchParams?.q || "";
  const animal = searchParams?.animal || "";
  const breedsParam = searchParams?.breed || "";
  const breeds = breedsParam
    ? (Array.isArray(breedsParam) ? breedsParam : [breedsParam])
    : [];
  const maxDistance = searchParams?.maxDistance || "";
  const sortBy = searchParams?.sort || "relevance";
  const userLat = searchParams?.userLat || "";
  const userLng = searchParams?.userLng || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));

  const hasSearchCriteria = !!(breeds.length > 0 || query.trim() || userLat || animal);

  let breeders = [];
  let totalCount = 0;
  let totalPages = 0;

  if (hasSearchCriteria) {
    const result = await searchBreeders({
      query,
      animal,
      breeds,
      maxDistance,
      sortBy,
      userLat,
      userLng,
      page,
    });
    breeders = result.breeders;
    totalCount = result.totalCount;
    totalPages = result.totalPages;
  }

  return (
    <>
      <PageViewTracker page="search" />
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 md:px-8">
        <Breadcrumbs items={[{ label: "Search" }]} />
      </div>
      {hasSearchCriteria && (
        <SearchAnalyticsTracker
          query={query}
          breed={breeds.join(", ")}
          animal={animal}
          location={query}
          resultsCount={totalCount}
          page={page}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Search breeders</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Find breeders by town, postcode, or breed</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Browse public breeder listings across the UK. Compare available information before reaching out. BreedWise does not endorse or vet breeders.
          </p>
        </div>

        <div className="mt-8">
          <SearchForm
            initialLocation={query}
            initialAnimal={animal}
            initialBreeds={breeds}
            initialMaxDistance={maxDistance}
            initialSort={sortBy}
            initialUserLat={userLat}
            initialUserLng={userLng}
          />
        </div>

        <div className="mt-4">
          <RecentSearches />
        </div>

        <div className="mt-8">
          {!hasSearchCriteria ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6FFFB]">
                <SearchX className="h-10 w-10 text-[#00BFA5]" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">Start your search</h2>
              <p className="mt-2 max-w-md mx-auto text-sm text-slate-500">
                Select an animal type and breeds, enter a location, or click &quot;Use my location&quot; to find breeders near you.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-[#F1F4F6] px-4 py-2 text-sm text-slate-600">
                  <PawPrint className="h-4 w-4 text-[#00BFA5]" />
                  Choose an animal type
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#F1F4F6] px-4 py-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-[#00BFA5]" />
                  Enter a location
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#F1F4F6] px-4 py-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-[#00BFA5]" />
                  Use my location
                </div>
              </div>
            </div>
          ) : (
            <SearchResults
              breeders={breeders}
              query={query}
              breed={breeds.join(", ")}
              animal={animal}
              sortBy={sortBy}
              userLat={userLat}
              userLng={userLng}
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={24}
            />
          )}

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
      </div>
    </>
  );
}
