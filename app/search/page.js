import SearchResults from "@components/SearchResults";
import SearchForm from "@components/SearchForm";
import PageViewTracker from "@components/PageViewTracker";
import AdSensePlaceholder from "@components/AdSensePlaceholder";
import { createClient } from "@/lib/supabase/server";
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
            return sorted;
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

    const supabase = createClient();
    let dbQuery = supabase
        .from("breeders")
        .select("*, breeder_breeds(breed)", { count: "exact" })
        .in("status", ["public_listing", "claimed_profile"]);

    if (query && query !== "My location") {
        const safe = query.replace(/[%_(),&]/g, "");
        if (safe) {
            dbQuery = dbQuery.or(`name.ilike.%${safe}%,town.ilike.%${safe}%,postcode.ilike.%${safe}%,address.ilike.%${safe}%`);
        }
    }

    dbQuery = dbQuery.order("name", { ascending: true });
    const { data, error, count } = await dbQuery;

    let breeders = [];
    let totalCount = 0;
    let totalPages = 0;

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

        // Calculate distance from user location if provided
        breeders = calculateDistanceFromUser(breeders, userLat, userLng);

        // Apply max distance filter
        if (maxDistance) {
            const max = parseFloat(maxDistance);
            breeders = breeders.filter((b) => b.distance !== null && b.distance <= max);
            totalCount = breeders.length;
        }

        // Sort
        breeders = sortBreeders(breeders, sortBy);

        // Pagination
        totalPages = Math.ceil(totalCount / PAGE_SIZE);
        const start = (page - 1) * PAGE_SIZE;
        breeders = breeders.slice(start, start + PAGE_SIZE);
    }

    return (
        <>
            <PageViewTracker page="search" />
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

                {/* Main layout: content + sidebar ad */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
                    {/* Main content column */}
                    <div className="space-y-8">
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

                        {/* Educational content block */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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

                    {/* Sidebar ad — desktop only, sticky */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24">
                            <AdSensePlaceholder mobileFormat="horizontal" desktopFormat="vertical" />
                        </div>
                    </aside>
                </div>

                {/* Mobile ad — below content on small screens */}
                <div className="mt-8 lg:hidden">
                    <AdSensePlaceholder mobileFormat="horizontal" desktopFormat="horizontal" />
                </div>
            </div>
        </>
    );
}
