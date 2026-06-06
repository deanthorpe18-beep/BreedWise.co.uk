import SearchResults from "@components/SearchResults";
import SearchForm from "@components/SearchForm";
import PageViewTracker from "@components/PageViewTracker";
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

function toLegacyFormat(breeder) {
    return {
        id: breeder.slug,
        slug: breeder.slug,
        name: { value: breeder.name, source: "google", last_updated_at: breeder.last_updated_at },
        address: { value: breeder.address, source: "google", last_updated_at: breeder.last_updated_at },
        town: { value: breeder.town, source: "google", last_updated_at: breeder.last_updated_at },
        postcode: { value: breeder.postcode, source: "google", last_updated_at: breeder.last_updated_at },
        country: { value: "UK", source: "admin", last_updated_at: breeder.last_updated_at },
        region: { value: "England", source: "admin", last_updated_at: breeder.last_updated_at },
        county: { value: breeder.county, source: "admin", last_updated_at: breeder.last_updated_at },
        coordinates: { lat: breeder.lat, lng: breeder.lng },
        website: { value: breeder.website, source: "google", last_updated_at: breeder.last_updated_at },
        phone: { value: breeder.phone, source: "google", last_updated_at: breeder.last_updated_at },
        email: { value: breeder.email, source: "website", last_updated_at: breeder.last_updated_at },
        google_rating: { value: breeder.google_rating, source: "google", last_updated_at: breeder.last_updated_at },
        place_id: { value: breeder.google_place_id || `place-${breeder.slug}`, source: "google", last_updated_at: breeder.last_updated_at },
        breeds: breeder.breeds?.map((name) => ({ name, source: "website" })) || [],
        kennel_club: { value: breeder.kennel_club, source: "website", last_updated_at: breeder.last_updated_at },
        council_licence: { value: breeder.council_licence, source: "website", last_updated_at: breeder.last_updated_at },
        health_testing: { value: breeder.health_testing, source: "website", last_updated_at: breeder.last_updated_at },
        about: breeder.about,
        location_notes: breeder.location_notes,
        status: breeder.status,
        claimed: breeder.claimed,
        save_count: 0,
        last_updated_at: breeder.last_updated_at,
        source_tags: breeder.source_tags,
        confidence_score: breeder.confidence_score,
        distance: breeder.distance,
        hero_image_url: breeder.hero_image_url,
    };
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

function enrichWithDistance(breeders, locationQuery) {
    if (!locationQuery) return breeders.map((item) => ({ ...item, distance: null }));

    // Find a breeder whose town matches the query to use as reference point
    const reference = breeders.find((b) =>
        b.town?.toLowerCase().includes(locationQuery.toLowerCase())
    );

    if (!reference || !reference.lat || !reference.lng) {
        return breeders.map((item) => ({ ...item, distance: null }));
    }

    return breeders.map((item) => ({
        ...item,
        distance: distanceMiles(reference.lat, reference.lng, item.lat, item.lng),
    }));
}

export default async function SearchPage({ searchParams }) {
    const query = searchParams?.q || "";
    const breed = searchParams?.breed || "";

    const supabase = createClient();
    let dbQuery = supabase
        .from("breeders")
        .select("*, breeder_breeds(breed)")
        .in("status", ["public_listing", "claimed_profile"]);

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,town.ilike.%${query}%,postcode.ilike.%${query}%,address.ilike.%${query}%`);
    }

    dbQuery = dbQuery.order("name", { ascending: true });
    const { data, error } = await dbQuery;

    let breeders = [];
    if (!error && data) {
        breeders = data.map((b) => ({
            ...b,
            breeds: b.breeder_breeds?.map((bb) => bb.breed) || [],
            breeder_breeds: undefined,
        }));

        if (breed) {
            const breedLower = breed.toLowerCase();
            breeders = breeders.filter((b) => b.breeds.some((br) => br.toLowerCase() === breedLower));
        }

        breeders = enrichWithDistance(breeders, query);
        breeders = breeders.map(toLegacyFormat);
    }

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
                    <SearchResults breeders={breeders} query={query} breed={breed} />
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
