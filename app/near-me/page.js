import { createClient } from "@/lib/supabase/server";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { websiteSchema } from "@/lib/seo/schema";
import Link from "next/link";
import { MapPin, Dog, Search, Crosshair } from "lucide-react";

export const metadata = baseMetadata({
  title: "Dog breeders near me — UK breeder directory",
  description: "Find dog breeders near your current location. Browse public breeder listings across the UK with distance-based search.",
  path: "/near-me",
});

export const dynamic = "force-dynamic";

export default async function NearMePage() {
  const supabase = createClient();

  // Get popular breeds for quick links
  const { data: breeds } = await supabase
    .from("breeds")
    .select("name")
    .eq("is_popular", true)
    .order("name")
    .limit(12);

  // Get popular locations
  const { data: locations } = await supabase
    .from("breeders")
    .select("town, county")
    .in("status", ["public_listing", "claimed_profile"])
    .limit(100);

  const uniqueTowns = [...new Set((locations || []).map((l) => l.town))].slice(0, 12);

  const structuredData = websiteSchema();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Location search</p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Dog breeders near me</h1>
        <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-600">
          Use your location to find dog breeders within a specific distance. We will show you breeders sorted by proximity.
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6FFFB]">
          <Crosshair className="h-8 w-8 text-[#00BFA5]" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Find breeders near you</h2>
        <p className="mt-2 text-sm text-slate-500">
          We need access to your location to show nearby breeders. Your location is only used for this search and is not stored.
        </p>
        <button
          onClick={() => {
            if (!navigator.geolocation) {
              alert("Geolocation is not supported by your browser.");
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = pos.coords.latitude.toFixed(6);
                const lng = pos.coords.longitude.toFixed(6);
                window.location.href = `/search?userLat=${lat}&userLng=${lng}&maxDistance=25&sort=distance`;
              },
              () => alert("Unable to get your location. Please enter a town manually."),
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
        >
          <MapPin className="h-4 w-4" />
          Use my location
        </button>
        <p className="mt-4 text-xs text-slate-400">or</p>
        <Link href="/search" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#00BFA5] hover:text-[#008f7a]">
          <Search className="h-4 w-4" />
          Search by town or breed
        </Link>
      </div>

      {/* Popular breeds near me */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Popular breeds near you</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {(breeds || []).map((b) => (
            <Link
              key={b.name}
              href={`/breeders/${encodeURIComponent(b.name)}`}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:bg-[#E6FFFB] hover:text-[#00BFA5]"
            >
              <Dog className="h-4 w-4 flex-shrink-0" />
              {b.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Popular locations */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Popular locations</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {uniqueTowns.map((town) => (
            <Link
              key={town}
              href={`/breeders/location/${encodeURIComponent(town)}`}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:bg-[#E6FFFB] hover:text-[#00BFA5]"
            >
              <MapPin className="h-4 w-4 flex-shrink-0" />
              {town}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
