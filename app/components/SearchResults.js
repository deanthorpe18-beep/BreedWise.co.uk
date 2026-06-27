"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Star, ChevronRight, Layers, Image as ImageIcon, ChevronLeft, MessageCircle, Crown, ArrowRight, Calendar, ExternalLink } from "lucide-react";
import SaveBreederButton from "./SaveBreederButton";
import MembershipBadge, { getTierBorderClasses } from "./MembershipBadge";
import JustClaimedBadge from "./JustClaimedBadge";
import BreederTrustBadges from "./BreederTrustBadges";
import SearchImpressionTracker from "./SearchImpressionTracker";
import AdSensePlaceholder from "./AdSensePlaceholder";
import { trackCtaClick } from "@lib/analytics-client";
import SearchFilters, { DEFAULT_FILTERS } from "./SearchFilters";
import { trackSearch, trackFilterUsage } from "@lib/analytics";
import { getBreederHeroUrl } from "@lib/breeder-images";

function formatDistance(distance) {
  return distance === null || distance === undefined ? null : `${distance} mi`;
}

function applyFilters(breeders, filters) {
  return breeders.filter((breeder) => {
    if (breeder.distance != null && breeder.distance > filters.maxDistance) return false;
    if (filters.healthTesting === "yes" && !breeder.health_testing?.trim()) return false;
    if (filters.healthTesting === "no" && breeder.health_testing?.trim()) return false;
    if (filters.kennelClub === "yes" && !breeder.kennel_club?.trim()) return false;
    if (filters.kennelClub === "no" && breeder.kennel_club?.trim()) return false;
    if (filters.councilLicence === "yes" && !breeder.council_licence?.trim()) return false;
    if (filters.councilLicence === "no" && breeder.council_licence?.trim()) return false;
    if (filters.availableOnly && breeder.availability_status !== "available") return false;
    return true;
  });
}

export default function SearchResults({
  breeders, query, breederName = "", breed, animal, sortBy, userLat, userLng,
  currentPage = 1, totalPages = 1, totalCount = 0, pageSize = 24,
  availableOnly = false, licensedOnly = false, kcOnly = false, healthOnly = false, verifiedOnly = false,
}) {
  const urlInitialFilters = useMemo(() => ({
    councilLicence: licensedOnly || verifiedOnly ? "yes" : null,
    kennelClub: kcOnly ? "yes" : null,
    healthTesting: healthOnly ? "yes" : null,
    availableOnly: availableOnly || false,
  }), [licensedOnly, verifiedOnly, kcOnly, healthOnly, availableOnly]);

  const lockedFilters = useMemo(() => ({
    ...(licensedOnly || verifiedOnly ? { councilLicence: true } : {}),
    ...(kcOnly ? { kennelClub: true } : {}),
    ...(healthOnly ? { healthTesting: true } : {}),
    ...(availableOnly ? { availableOnly: true } : {}),
  }), [licensedOnly, verifiedOnly, kcOnly, healthOnly, availableOnly]);

  const [mapView, setMapView] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...urlInitialFilters });
  const [tracked, setTracked] = useState(false);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    trackFilterUsage(newFilters);
  };

  const filteredBreeders = useMemo(() => applyFilters(breeders, filters), [breeders, filters]);

  const hasExtraClientFilters = useMemo(() => {
    return filters.maxDistance !== DEFAULT_FILTERS.maxDistance;
  }, [filters.maxDistance]);

  const displayCount = hasExtraClientFilters ? filteredBreeders.length : totalCount;

  useEffect(() => {
    if (!tracked && breeders.length > 0) {
      trackSearch(query, breed, totalCount);
      setTracked(true);
    }
  }, [tracked, breeders.length, totalCount, query, breed]);

  const locationItems = useMemo(() => {
    return filteredBreeders
      .filter((b) => b.lat != null && b.lng != null)
      .map((b) => ({
        slug: b.slug,
        name: b.name,
        town: b.town,
        county: b.county,
        distance: b.distance,
        lat: b.lat,
        lng: b.lng,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.lat},${b.lng}`)}`,
      }))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [filteredBreeders]);

  const buildPageUrl = (pageNum) => {
    const params = new URLSearchParams();
    if (query && query !== "My location") params.set("q", query);
    if (breederName) params.set("name", breederName);
    if (breed) params.set("breed", breed);
    if (animal) params.set("animal", animal);
    if (userLat) params.set("userLat", userLat);
    if (userLng) params.set("userLng", userLng);
    if (sortBy && sortBy !== "relevance") params.set("sort", sortBy);
    if (availableOnly) params.set("available", "1");
    if (licensedOnly) params.set("licensed", "1");
    if (kcOnly) params.set("kc", "1");
    if (healthOnly) params.set("health", "1");
    if (verifiedOnly) params.set("verified", "1");
    params.set("page", String(pageNum));
    return `/search?${params.toString()}`;
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + breeders.length - 1, totalCount);

  return (
    <section className="space-y-6">
      <SearchImpressionTracker slugs={breeders.map((b) => b.slug)} />
      <SearchFilters
        onFiltersChange={handleFiltersChange}
        breeders={breeders}
        initialFilters={urlInitialFilters}
        lockedFilters={lockedFilters}
      />

      <div className="flex flex-col gap-3 rounded-3xl border border-[#00BFA5]/15 bg-gradient-to-r from-white to-[#E6FFFB]/40 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#00BFA5]">Results</p>
          <h2 className="text-2xl font-semibold text-slate-900">{displayCount} breeders found</h2>
          <p className="text-sm text-slate-500">
            {displayCount > 0
              ? hasExtraClientFilters
                ? `Showing ${filteredBreeders.length} on this page (${totalCount} total from search)`
                : `Showing ${startIndex}–${endIndex} of ${totalCount}`
              : "No results"}
            {breed ? ` · ${breed}` : ""}
            {breederName ? ` · name: ${breederName}` : ""}
            {query && query !== "My location" ? ` · ${query}` : ""}
            {userLat && userLng ? " · sorted by distance" : ""}
            {sortBy === "rating" ? " · sorted by rating" : ""}
          </p>
        </div>
        <div className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-1">
          <button type="button" className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${!mapView ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`} onClick={() => setMapView(false)}>
            <Layers className="h-4 w-4" /> List
          </button>
          <button type="button" className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${mapView ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`} onClick={() => setMapView(true)}>
            <MapPin className="h-4 w-4" /> Locations
          </button>
        </div>
      </div>

      {mapView ? (
        <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5 shadow-sm">
          {locationItems.length > 0 ? (
            <>
              <p className="text-sm text-slate-600">
                {locationItems.length} listing{locationItems.length === 1 ? "" : "s"} with map coordinates on this page.
                Open in Google Maps or view the full profile.
              </p>
              <div className="mt-4 space-y-3 max-h-[480px] overflow-y-auto">
                {locationItems.map((item) => (
                  <div key={item.slug} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.town}{item.county ? `, ${item.county}` : ""}
                        {item.distance != null ? ` · ${item.distance} mi` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={item.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <ExternalLink className="h-4 w-4" /> Google Maps
                      </a>
                      <Link
                        href={`/breeder/${item.slug}`}
                        className="inline-flex items-center gap-2 rounded-full bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00a98e]"
                      >
                        View profile <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">No locations with coordinates on this page — try list view or widen your search.</p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBreeders.map((breeder, index) => (
            <div key={breeder.slug}>
              {index > 0 && index % 3 === 0 && <AdSensePlaceholder mobileFormat="horizontal" desktopFormat="horizontal" />}
              <BreederCard breeder={breeder} />
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <Link href={currentPage > 1 ? buildPageUrl(currentPage - 1) : "#"} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${currentPage > 1 ? "border border-slate-200 text-slate-700 hover:bg-slate-50" : "text-slate-400 cursor-not-allowed pointer-events-none"}`}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Link>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push(<span key={`gap-${p}`} className="px-2 text-slate-400">…</span>);
                acc.push(<Link key={p} href={buildPageUrl(p)} className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${p === currentPage ? "bg-[#00BFA5] text-white" : "text-slate-700 hover:bg-slate-100"}`}>{p}</Link>);
                return acc;
              }, [])}
          </div>
          <Link href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : "#"} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${currentPage < totalPages ? "border border-slate-200 text-slate-700 hover:bg-slate-50" : "text-slate-400 cursor-not-allowed pointer-events-none"}`}>
            Next <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {filteredBreeders.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#00BFA5]/30 bg-gradient-to-br from-[#E6FFFB]/50 to-white p-8 text-center text-slate-600">
          <p className="text-lg font-semibold text-slate-900">Nothing matched this search yet</p>
          <p className="mt-2">Try widening your radius, picking a nearby town, or removing a filter — good breeders are worth the extra look.</p>
        </div>
      )}
    </section>
  );
}

function TrustScore({ breeder }) {
  let score = 0;
  if (breeder.status === "claimed_profile") score += 30;
  if (breeder.licence_verified) score += 25;
  else if (breeder.council_licence) score += 15;
  if (breeder.kc_verified) score += 20;
  else if (breeder.kennel_club) score += 10;
  if (breeder.gccf_verified || breeder.tica_verified || breeder.other_registry_verified) score += 15;
  if (breeder.health_testing) score += 15;
  if (breeder.google_rating && breeder.google_rating >= 4.0) score += 10;
  if ((breeder.breeder_photos?.length || breeder.photos?.length || 0) > 0) score += 5;

  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-[#00BFA5]" : score >= 25 ? "bg-amber-400" : "bg-slate-300";
  const label = score >= 80 ? "Highly trusted" : score >= 50 ? "Trusted" : score >= 25 ? "Basic info" : "Limited info";

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">Trust score</span>
        <span className={`font-bold ${score >= 50 ? "text-[#00BFA5]" : "text-slate-400"}`}>{score}/100 · {label}</span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function AvailabilityBadge({ status }) {
  const config = {
    available: { text: "Available", className: "bg-green-100 text-green-700", icon: Calendar },
    waitlist: { text: "Waitlist", className: "bg-blue-100 text-blue-700", icon: Calendar },
    not_available: { text: "No litters", className: "bg-slate-100 text-slate-500", icon: Calendar },
    paused: { text: "Paused", className: "bg-amber-100 text-amber-700", icon: Calendar },
  };
  const c = config[status] || config.available;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${c.className}`}>
      <Icon className="h-3 w-3" /> {c.text}
    </span>
  );
}

function BreederCard({ breeder }) {
  const distance = formatDistance(breeder.distance);
  const breeds = breeder.breeds || [];
  const isClaimed = breeder.status === "claimed_profile";
  const heroUrl = getBreederHeroUrl(breeder);
  const hasHero = !!heroUrl;

  // Get border color based on tier + claim status
  const borderClasses = getTierBorderClasses(breeder.membership_tier, breeder.status);

  return (
    <div className={`group rounded-3xl border-2 bg-white p-0 shadow-sm transition hover:shadow-lg overflow-hidden ${isClaimed ? `${borderClasses.border} ring-2 ${borderClasses.ring}` : "border-slate-200 hover:border-[#00BFA5]/40"}`}>
      <div className="flex flex-col sm:flex-row">
        {/* Left: Image */}
        <div className="relative sm:w-56 sm:flex-shrink-0">
          <div className="aspect-[4/3] sm:aspect-auto sm:h-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
            {hasHero ? (
              <img src={heroUrl} alt={breeder.name} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-10 w-10 text-slate-300" />
              </div>
            )}
          </div>
          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <MembershipBadge tier={breeder.membership_tier} status={breeder.status} size="sm" />
            <JustClaimedBadge claimedAt={breeder.claimed_at} size="small" />
            <AvailabilityBadge status={breeder.availability_status} />
          </div>
          {breeder.is_featured && (
            <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              <Crown className="h-3 w-3" /> Featured
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900 truncate">{breeder.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {breeder.town}{breeder.county ? `, ${breeder.county}` : ""}
                </span>
                {distance && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{distance}</span>
                )}
                {breeder.google_rating ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {breeder.google_rating}
                    {breeder.google_review_count ? ` (${breeder.google_review_count})` : ""}
                  </span>
                ) : null}
              </div>
            </div>
            <SaveBreederButton breederId={breeder.id} breederSlug={breeder.slug} breederName={breeder.name} />
          </div>

          {/* Breeds */}
          {breeds.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {breeds.slice(0, 5).map((breedName) => (
                <span key={breedName} className="inline-flex items-center rounded-full bg-[#E6FFFB] px-2.5 py-1 text-xs font-medium text-[#00BFA5]">{breedName}</span>
              ))}
              {breeds.length > 5 && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">+{breeds.length - 5} more</span>
              )}
            </div>
          )}

          <div className="mt-3">
            <BreederTrustBadges breeder={breeder} />
          </div>

          {/* Info row — only show details not covered by badges */}
          {!breeder.council_licence && !breeder.kennel_club && !breeder.health_testing && (
            <p className="mt-3 text-xs text-slate-400">No licence or health info listed yet — ask the breeder directly.</p>
          )}

          {/* Trust Score */}
          <TrustScore breeder={breeder} />

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/breeder/${breeder.slug}`} className="inline-flex items-center gap-2 rounded-2xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00a98e]">
              View profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {isClaimed && (
              <form className="contents" onSubmit={async (e) => {
                e.preventDefault();
                const res = await fetch("/api/messages/conversations", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ breeder_id: breeder.id, subject: `Enquiry about ${breeder.name}` }),
                });
                const data = await res.json();
                if (data.conversation?.id) window.location.href = `/messages/${data.conversation.id}`;
                else if (data.error === "Unauthorized") window.location.href = `/auth/login?redirect=/search`;
              }}>
                <button type="submit" className="inline-flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-100">
                  <MessageCircle className="h-4 w-4" /> Message
                </button>
              </form>
            )}
            {breeder.phone ? (
              <a href={`tel:${breeder.phone}`} onClick={() => trackCtaClick(breeder.slug, "call")} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <Phone className="h-4 w-4" /> Call
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-400">
                <Phone className="h-4 w-4" /> No phone
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
