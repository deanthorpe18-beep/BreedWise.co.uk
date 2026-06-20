import { createClient } from "@/lib/supabase/server";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { websiteSchema } from "@/lib/seo/schema";
import Link from "next/link";
import { MapPin, PawPrint } from "lucide-react";
import NearMeGeoButton from "@components/NearMeGeoButton";

export const metadata = baseMetadata({
  title: "Pet breeders near me — UK breeder directory",
  description: "Find pet breeders near your current location. Browse dogs, cats, birds and more across the UK with distance-based search.",
  path: "/near-me",
});

export const dynamic = "force-dynamic";

export default async function NearMePage() {
  const supabase = createClient();

  const { data: breeds } = await supabase
    .from("breeds")
    .select("name")
    .eq("is_popular", true)
    .order("name")
    .limit(12);

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
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#00BFA5]">Location search</p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Pet breeders near me</h1>
        <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
          Share your location and we&apos;ll show breeders within 25 miles — dogs, cats, birds, fish, reptiles and small pets, sorted by distance.
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-[#00BFA5]/15 bg-gradient-to-br from-[#E6FFFB] via-white to-[#FFF5F0] p-8 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6FFFB]">
          <MapPin className="h-8 w-8 text-[#00BFA5]" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Find breeders near you</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your location is only used for this search and is not stored.
        </p>
        <NearMeGeoButton />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Popular breeds near you</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {(breeds || []).map((b) => (
            <Link
              key={b.name}
              href={`/search?breed=${encodeURIComponent(b.name)}`}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:bg-[#E6FFFB] hover:text-[#00BFA5]"
            >
              <PawPrint className="h-4 w-4 flex-shrink-0" />
              {b.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Popular locations</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {uniqueTowns.map((town) => (
            <Link
              key={town}
              href={`/search?q=${encodeURIComponent(town)}`}
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
