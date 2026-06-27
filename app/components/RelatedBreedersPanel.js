import Link from "next/link";
import { Dog, Star, MapPin, ArrowRight, GitCompare } from "lucide-react";
import SaveBreederButton from "@components/SaveBreederButton";
import MembershipBadge from "@components/MembershipBadge";
import { getBreederHeroUrl } from "@/lib/breeder-images";

function BreederMiniCard({ breeder, sharedBreeds = [] }) {
  const heroUrl = getBreederHeroUrl(breeder);

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm transition hover:border-[#00BFA5]/40 hover:shadow-md">
      <Link href={`/breeder/${breeder.slug}`} className="flex items-start gap-3">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 to-slate-100 ring-2 ring-white">
          {heroUrl ? (
            <img src={heroUrl} alt={breeder.name} className="h-full w-full object-cover" />
          ) : (
            <Dog className="h-7 w-7 m-3.5 text-slate-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate font-bold text-slate-900 group-hover:text-[#008f7a]">{breeder.name}</p>
            <MembershipBadge tier={breeder.membership_tier} size="sm" />
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{breeder.town}{breeder.county ? `, ${breeder.county}` : ""}</span>
          </p>
          {breeder.google_rating && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
              <Star className="h-3 w-3 fill-[#FFB545] text-[#FFB545]" />
              {breeder.google_rating}
            </p>
          )}
          {sharedBreeds.length > 0 && (
            <p className="mt-2 text-[11px] font-medium text-[#00BFA5]">
              Also breeds: {sharedBreeds.slice(0, 2).join(", ")}
              {sharedBreeds.length > 2 ? "…" : ""}
            </p>
          )}
        </div>
      </Link>
      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
        <SaveBreederButton
          breederId={breeder.id}
          breederSlug={breeder.slug}
          breederName={breeder.name}
          variant="icon"
        />
        <Link
          href={`/breeder/${breeder.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-[#00BFA5]/10 px-3 py-2 text-xs font-bold text-[#008f7a] transition hover:bg-[#00BFA5]/20"
        >
          View profile
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

export default function RelatedBreedersPanel({
  sameBreed = [],
  nearby = [],
  primaryBreed = "",
  town = "",
  searchHref = "",
}) {
  const hasSameBreed = sameBreed.length > 0;
  const hasNearby = nearby.length > 0;
  if (!hasSameBreed && !hasNearby) return null;

  return (
    <section className="space-y-6 rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-br from-[#E6FFFB]/60 via-white to-[#FFF0EB]/40 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#00BFA5]">
            <GitCompare className="h-4 w-4" />
            Compare breeders
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {hasSameBreed && primaryBreed
              ? `Other ${primaryBreed} breeders`
              : "Explore more listings"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Save profiles to compare side by side — most buyers view 3–5 breeders before enquiring.
          </p>
        </div>
        {searchHref && (
          <Link
            href={searchHref}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#00BFA5]/30 bg-white px-4 py-2 text-sm font-bold text-[#008f7a] shadow-sm transition hover:bg-[#E6FFFB]"
          >
            See all results
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {hasSameBreed && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sameBreed.map((b) => (
            <BreederMiniCard key={b.slug} breeder={b} sharedBreeds={b.matchingBreeds || []} />
          ))}
        </div>
      )}

      {hasNearby && (
        <div className={hasSameBreed ? "pt-2 border-t border-[#00BFA5]/10" : ""}>
          {hasSameBreed && (
            <h3 className="mb-4 text-sm font-bold text-slate-800">
              More breeders near {town || "you"}
            </h3>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((b) => (
              <BreederMiniCard key={b.slug} breeder={b} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
