import SearchResults from "@components/SearchResults";
import SearchForm from "@components/SearchForm";
import SearchQuickFilters from "@components/SearchQuickFilters";
import CompareBar from "@components/CompareBar";
import SaveSearchAlert from "@components/SaveSearchAlert";
import FeaturedBreeders from "@components/FeaturedBreeders";
import PageViewTracker from "@components/PageViewTracker";
import SearchAnalyticsTracker from "@components/SearchAnalyticsTracker";
import RecentSearches from "@components/RecentSearches";
import Breadcrumbs from "@components/Breadcrumbs";
import { searchBreeders } from "@/lib/search";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { MapPin, SearchX, PawPrint } from "lucide-react";
import { Suspense } from "react";

export function generateMetadata({ searchParams }) {
  const query = searchParams?.q || "";
  const breederName = searchParams?.name || "";
  const breeds = searchParams?.breed ? (Array.isArray(searchParams.breed) ? searchParams.breed : [searchParams.breed]) : [];
  const animal = searchParams?.animal || "";
  const breedLabel = breeds.length === 1 ? breeds[0] : breeds.length > 1 ? `${breeds.length} breeds` : "";
  const animalLabel = animal ? `${animal.charAt(0).toUpperCase() + animal.slice(1)}` : "Pet";

  let title = "Search breeders";
  if (breederName) title = `${breederName} — breeder search`;
  else if (breedLabel && query) title = `${breedLabel} breeders in ${query}`;
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
  const breederName = searchParams?.name || "";
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
  const availableOnly = searchParams?.available === "1";
  const licensedOnly = searchParams?.licensed === "1";
  const kcOnly = searchParams?.kc === "1";
  const verifiedOnly = searchParams?.verified === "1";

  const healthOnly = searchParams?.health === "1";

  const hasSearchCriteria = !!(breeds.length > 0 || query.trim() || breederName.trim() || userLat || animal);

  let breeders = [];
  let totalCount = 0;
  let totalPages = 0;

  if (hasSearchCriteria) {
    const result = await searchBreeders({
      query,
      breederName,
      animal,
      breeds,
      maxDistance,
      sortBy,
      userLat,
      userLng,
      page,
      availableOnly,
      licensedOnly,
      kcOnly,
      healthOnly,
      verifiedLicenceOnly: verifiedOnly,
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
      <SearchAnalyticsTracker
        query={query}
        breed={breeds.join(", ")}
        animal={animal}
        location={query}
        resultsCount={totalCount}
        page={page}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E6FFFB] via-white to-[#FFF5F0] p-8 sm:p-10 shadow-sm border border-[#00BFA5]/10">
          <div className="relative space-y-3">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#00BFA5]">Find your next companion</p>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">UK pet breeders, all in one place</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              Dogs, cats, birds, fish, reptiles and small pets — search by breed, location, or breeder name, compare listings, and contact breeders directly.
            </p>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#00BFA5]/10 blur-2xl" />
        </div>

        <div className="mt-8">
          <SearchForm
            initialLocation={query}
            initialBreederName={breederName}
            initialAnimal={animal}
            initialBreeds={breeds}
            initialMaxDistance={maxDistance}
            initialSort={sortBy}
            initialUserLat={userLat}
            initialUserLng={userLng}
          />
        </div>

        <div className="mt-4">
          <Suspense fallback={null}>
            <SearchQuickFilters />
          </Suspense>
        </div>

        <div className="mt-4">
          <RecentSearches />
        </div>

        {hasSearchCriteria && (
          <div className="mt-6 space-y-4">
            <FeaturedBreeders page="search" compact />
            <SaveSearchAlert
              query={query}
              breed={breeds.join(", ")}
              animal={animal}
              hasResults={totalCount > 0}
            />
          </div>
        )}

        <div className="mt-8">
          {!hasSearchCriteria ? (
            <div className="rounded-3xl border border-dashed border-[#00BFA5]/30 bg-gradient-to-br from-[#E6FFFB]/50 to-white p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6FFFB]">
                <SearchX className="h-10 w-10 text-[#00BFA5]" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">Ready when you are</h2>
              <p className="mt-2 max-w-md mx-auto text-sm text-slate-600">
                Search by breeder or kennel name, pick an animal type, choose a breed, enter a location — or tap &quot;Use my location&quot; to see who&apos;s nearby.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/search?animal=cat" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5]">
                  Browse cat breeders
                </Link>
                <Link href="/search?animal=fish" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5]">
                  Browse fish breeders
                </Link>
                <Link href="/near-me" className="inline-flex items-center gap-2 rounded-full bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00a98e]">
                  <MapPin className="h-4 w-4" /> Find breeders near me
                </Link>
                <Link href="/search?licensed=1" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5]">
                  Council licensed only
                </Link>
                <Link href="/account/compare" className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100">
                  Compare saved breeders
                </Link>
                <Link href="/education/choosing-a-breeder" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5]">
                  How to choose a breeder
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
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
              breederName={breederName}
              breed={breeds.join(", ")}
              animal={animal}
              sortBy={sortBy}
              userLat={userLat}
              userLng={userLng}
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={24}
              availableOnly={availableOnly}
              licensedOnly={licensedOnly}
              kcOnly={kcOnly}
              healthOnly={healthOnly}
              verifiedOnly={verifiedOnly}
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
      <CompareBar />
    </>
  );
}
