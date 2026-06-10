import SearchResults from "@components/SearchResults";
import SearchForm from "@components/SearchForm";
import PageViewTracker from "@components/PageViewTracker";
import SearchAnalyticsTracker from "@components/SearchAnalyticsTracker";
import RecentSearches from "@components/RecentSearches";
import { createClient } from "@/lib/supabase/server";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { Dog, MapPin, SearchX } from "lucide-react";

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

function distanceMiles(lat1, lon1, lat2, lon2) {
    const toRad = (degree) => (degree * Math.PI) / 180;
    const R = 3958.8;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
}

function calculateDistanceFromUser(breeders, userLat, userLng) {
    if (!userLat || !userLng) return breeders.map((item) => ({ ...item, distance: null }));
    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);
    return breeders.map((item) => ({
        ...item,
        distance: item.lat && item.lng ? distanceMiles(lat, lng, item.lat, item.lng) : null,
    }));
}

function getTierPriority(tier) {
    switch (tier) {
        case "gold": return 5;
        case "silver": return 4;
        case "bronze": return 3;
        case "free": return 2;
        default: return 1;
    }
}

function isJustClaimed(claimedAt) {
    if (!claimedAt) return false;
    const days = (Date.now() - new Date(claimedAt).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 14;
}

function getBreederRank(breeder) {
    const tierPriority = getTierPriority(breeder.membership_tier);
    const justClaimedBonus = isJustClaimed(breeder.claimed_at) ? 0.5 : 0;
    const featuredBonus = breeder.is_featured ? 0.3 : 0;
    return tierPriority + justClaimedBonus + featuredBonus;
}

function sortBreeders(breeders, sortBy) {
    const sorted = [...breeders];
    switch (sortBy) {
        case "distance":
            return sorted.sort((a, b) => {
                const da = a.distance ?? Infinity;
                const db = b.distance ?? Infinity;
                return da - db;
            });
        case "rating":
            return sorted.sort((a, b) => (b.google_rating || 0) - (a.google_rating || 0));
        case "name":
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return sorted.sort((a, b) => {
                const rankA = getBreederRank(a);
                const rankB = getBreederRank(b);
                if (rankB !== rankA) return rankB - rankA;
                return a.name.localeCompare(b.name);
            });
    }
}

const PAGE_SIZE = 24;

export default async function SearchPage({ searchParams }) {
    const query = searchParams?.q || "";
    const breed = searchParams?.breed || "";
    const maxDistance = searchParams?.maxDistance || "";
    const sortBy = searchParams?.sort || "relevance";
    const userLat = searchParams?.userLat || "";
    const userLng = searchParams?.userLng || "";
    const page = Math.max(1, parseInt(searchParams?.page || "1", 10));

    // Allow search if breed, location, OR geolocation is provided
    const hasSearchCriteria = !!(breed || query.trim() || userLat);

    let breeders = [];
    let totalCount = 0;
    let totalPages = 0;

    if (hasSearchCriteria) {
        const supabase = createClient();
        let dbQuery = supabase
            .from("breeders")
            .select("*, breeder_breeds(breed), breeder_photos(*)", { count: "exact" })
            .in("status", ["public_listing", "claimed_profile"]);

        if (query && query !== "My location") {
            const safe = query.replace(/[%_(),&]/g, "");
            if (safe) {
                dbQuery = dbQuery.or(`name.ilike.%${safe}%,town.ilike.%${safe}%,postcode.ilike.%${safe}%,address.ilike.%${safe}%`);
            }
        }

        dbQuery = dbQuery.order("name", { ascending: true });
        const { data, error, count } = await dbQuery;

        if (!error && data) {
            totalCount = count || data.length;
            breeders = data.map((b) => ({
                ...b,
                breeds: b.breeder_breeds?.map((bb) => bb.breed) || [],
                breeder_breeds: undefined,
            }));

            if (breed) {
                const breedLower = breed.toLowerCase();
                breeders = breeders.filter((b) => b.breeds.some((br) => br.toLowerCase() === breedLower));
                totalCount = breeders.length;
            }

            breeders = calculateDistanceFromUser(breeders, userLat, userLng);

            if (maxDistance && userLat && userLng) {
                const max = parseFloat(maxDistance);
                breeders = breeders.filter((b) => b.distance !== null && b.distance <= max);
                totalCount = breeders.length;
            }

            breeders = sortBreeders(breeders, sortBy);
            totalPages = Math.ceil(totalCount / PAGE_SIZE);
            const start = (page - 1) * PAGE_SIZE;
            breeders = breeders.slice(start, start + PAGE_SIZE);
        }
    }

    return (
        <>
            <PageViewTracker page="search" />
            {hasSearchCriteria && (
                <SearchAnalyticsTracker
                    query={query}
                    breed={breed}
                    location={query}
                    resultsCount={totalCount}
                    page={page}
                />
            )}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
                {/* Header */}
                <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Search breeders</p>
                    <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Find breeders by town, postcode, or breed</h1>
                    <p className="max-w-3xl text-sm leading-6 text-slate-600">
                        Browse public breeder listings across the UK. Compare available information before reaching out. BreedWise does not endorse or vet breeders.
                    </p>
                </div>

                {/* Search form */}
                <div className="mt-8">
                    <SearchForm
                        initialLocation={query}
                        initialBreed={breed}
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
                            /* Empty search state */
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6FFFB]">
                                    <SearchX className="h-10 w-10 text-[#00BFA5]" />
                                </div>
                                <h2 className="mt-6 text-xl font-semibold text-slate-900">Start your search</h2>
                                <p className="mt-2 max-w-md mx-auto text-sm text-slate-500">
                                    Select a breed from the dropdown, enter a location, or click &quot;Use my location&quot; to find breeders near you. You can also combine filters.
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-3">
                                    <div className="flex items-center gap-2 rounded-full bg-[#F1F4F6] px-4 py-2 text-sm text-slate-600">
                                        <Dog className="h-4 w-4 text-[#00BFA5]" />
                                        Choose a breed
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
                                breed={breed}
                                sortBy={sortBy}
                                userLat={userLat}
                                userLng={userLng}
                                currentPage={page}
                                totalPages={totalPages}
                                totalCount={totalCount}
                                pageSize={PAGE_SIZE}
                            />
                        )}

                        {/* Educational content block */}
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
