"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Star, Globe, ChevronRight, Layers, Image as ImageIcon, ChevronLeft, MessageCircle, Crown } from "lucide-react";
import SaveBreederButton from "./SaveBreederButton";
import MembershipBadge from "./MembershipBadge";
import JustClaimedBadge from "./JustClaimedBadge";
import AdSensePlaceholder from "./AdSensePlaceholder";
import { trackCtaClick } from "@lib/analytics-client";
import SearchFilters from "./SearchFilters";
import { trackSearch, trackFilterUsage, trackSaveBreeder } from "@lib/analytics";

function formatDistance(distance) {
  return distance === null || distance === undefined ? "—" : `${distance} mi`;
}

function applyFilters(breeders, filters) {
  return breeders.filter((breeder) => {
    if (breeder.distance !== null && breeder.distance > filters.maxDistance) {
      return false;
    }
    return true;
  });
}

export default function SearchResults({
  breeders,
  query,
  breed,
  sortBy,
  userLat,
  userLng,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 24,
}) {
  const [mapView, setMapView] = useState(false);
  const [filters, setFilters] = useState({
    maxDistance: 50,
  });
  const [tracked, setTracked] = useState(false);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    trackFilterUsage(newFilters);
  };

  const filteredBreeders = useMemo(() => {
    return applyFilters(breeders, filters);
  }, [breeders, filters]);

  useEffect(() => {
    if (!tracked && breeders.length > 0) {
      trackSearch(query, breed, totalCount);
      setTracked(true);
    }
  }, [tracked, breeders.length, totalCount, query, breed]);

  const mapPoints = useMemo(() => {
    if (!filteredBreeders.length) return [];
    const minLat = Math.min(...filteredBreeders.map((item) => item.lat || 0));
    const maxLat = Math.max(...filteredBreeders.map((item) => item.lat || 0));
    const minLng = Math.min(...filteredBreeders.map((item) => item.lng || 0));
    const maxLng = Math.max(...filteredBreeders.map((item) => item.lng || 0));

    return filteredBreeders.map((item) => {
      const x = maxLng === minLng ? 50 : ((item.lng - minLng) / (maxLng - minLng)) * 100;
      const y = maxLat === minLat ? 50 : ((maxLat - item.lat) / (maxLat - minLat)) * 100;
      return { slug: item.slug, x, y, name: item.name };
    });
  }, [filteredBreeders]);

  // Build pagination URL
  const buildPageUrl = (pageNum) => {
    const params = new URLSearchParams();
    if (query && query !== "My location") params.set("q", query);
    if (breed) params.set("breed", breed);
    if (userLat) params.set("userLat", userLat);
    if (userLng) params.set("userLng", userLng);
    if (sortBy && sortBy !== "relevance") params.set("sort", sortBy);
    params.set("page", String(pageNum));
    return `/search?${params.toString()}`;
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + breeders.length - 1, totalCount);

  return (
    <section className="space-y-6">
      <SearchFilters onFiltersChange={handleFiltersChange} breeders={breeders} />

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Results</p>
          <h2 className="text-2xl font-semibold text-slate-900">{totalCount} breeders found</h2>
          <p className="text-sm text-slate-500">
            {totalCount > 0 ? `Showing ${startIndex}–${endIndex} of ${totalCount}` : "No results"}
            {breed ? ` · ${breed}` : ""}
            {userLat && userLng ? " · sorted by distance" : ""}
            {sortBy === "rating" ? " · sorted by rating" : ""}
          </p>
        </div>
        <div className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${!mapView ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            onClick={() => setMapView(false)}
          >
            <Layers className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${mapView ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            onClick={() => setMapView(true)}
          >
            <MapPin className="h-4 w-4" />
            Map
          </button>
        </div>
      </div>

      {mapView ? (
        <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5 shadow-sm">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 via-white to-slate-200">
            {mapPoints.map((point) => (
              <Link
                key={point.slug}
                href={`/breeder/${point.slug}`}
                className="absolute inline-flex translate-x-[-50%] translate-y-[-50%] flex-col items-center gap-2 text-xs"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <span className="rounded-full bg-[#00BFA5] px-2 py-1 text-white shadow-lg shadow-[#00BFA5]/20">{point.name.split(" ")[0]}</span>
                <span className="h-3 w-3 rounded-full bg-[#FF6B6B] ring-2 ring-white" />
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">Map markers show approximate public listing locations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBreeders.map((breeder, index) => (
            <>
              {index > 0 && index % 3 === 0 && (
                <AdSensePlaceholder mobileFormat="horizontal" desktopFormat="horizontal" />
              )}
              <div key={breeder.slug} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                {/* Left section - Main info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold text-slate-900">{breeder.name}</h3>
                    <p className="text-sm text-slate-600">{breeder.town}{breeder.county ? `, ${breeder.county}` : ""}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <MembershipBadge tier={breeder.membership_tier} size="sm" />
                    <JustClaimedBadge claimedAt={breeder.claimed_at} size="small" />
                    {breeder.is_featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700 font-bold">
                        <Crown className="h-3 w-3" />
                        Featured
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">{formatDistance(breeder.distance)}</span>
                    {breeder.google_rating ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                        <Star className="h-3 w-3 text-[#FFB545] fill-[#FFB545]" />
                        {breeder.google_rating}
                        {breeder.google_review_count ? ` (${breeder.google_review_count})` : ""}
                      </span>
                    ) : null}
                    {breeder.business_type ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">{breeder.business_type}</span>
                    ) : null}
                    {breeder.breeds?.slice(0, 3).map((breedName) => (
                      <span key={breedName} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">{breedName}</span>
                    ))}
                  </div>

                  {/* Real photo from Google Places */}
                  <div className="mt-4">
                    {breeder.hero_image_url ? (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={breeder.hero_image_url}
                            alt={`${breeder.name} — photo from Google Places`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-gradient-to-br', 'from-slate-100', 'to-slate-200', 'flex', 'items-center', 'justify-center'); const icon = document.createElement('div'); icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-slate-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'; e.target.parentElement.appendChild(icon.firstChild); }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {breeder.hero_image_url ? "Photo from Google Places" : "No photos available"}
                    </p>
                  </div>

                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                    <Link href={`/breeder/${breeder.slug}`} className="rounded-3xl bg-[#00BFA5] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#00a98e]">
                      View profile
                    </Link>
                    {breeder.status === "claimed_profile" && (
                      <form
                        className="contents"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const res = await fetch("/api/messages/conversations", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ breeder_id: breeder.id, subject: `Enquiry about ${breeder.name}` }),
                          });
                          const data = await res.json();
                          if (data.conversation?.id) {
                            window.location.href = `/messages/${data.conversation.id}`;
                          } else if (data.error === "Unauthorized") {
                            window.location.href = `/auth/login?redirect=/search`;
                          }
                        }}
                      >
                        <button type="submit" className="rounded-3xl border border-purple-200 bg-purple-50 px-4 py-3 text-center text-sm font-semibold text-purple-700 transition hover:bg-purple-100">
                          <MessageCircle className="inline h-4 w-4 mr-1" />
                          Message
                        </button>
                      </form>
                    )}
                    {breeder.phone ? (
                      <a href={`tel:${breeder.phone}`} onClick={() => trackCtaClick(breeder.slug, "call")} className="rounded-3xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                        Call
                      </a>
                    ) : (
                      <span className="rounded-3xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-400">
                        No phone
                      </span>
                    )}
                    <SaveBreederButton breederId={breeder.id} breederName={breeder.name} />
                  </div>
                </div>

                {/* Right section - Details */}
                <div className="grid gap-3 min-w-[180px] text-sm text-slate-600">
                  <div className="rounded-3xl bg-[#F1F4F6] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Public info</p>
                    <p className="mt-2">KC: {breeder.kennel_club || "Unknown"}</p>
                    <p>Council licence: {breeder.council_licence || "Unknown"}</p>
                    <p>Health testing: {breeder.health_testing || "Unknown"}</p>
                  </div>
                  <div className="rounded-3xl bg-[#F1F4F6] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Last updated</p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {breeder.last_updated_at
                        ? new Date(breeder.last_updated_at).toLocaleDateString("en-GB")
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <Link
            href={currentPage > 1 ? buildPageUrl(currentPage - 1) : "#"}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              currentPage > 1
                ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
                : "text-slate-400 cursor-not-allowed pointer-events-none"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, current, and neighbors
                return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
              })
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  acc.push(<span key={`gap-${p}`} className="px-2 text-slate-400">…</span>);
                }
                acc.push(
                  <Link
                    key={p}
                    href={buildPageUrl(p)}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                      p === currentPage
                        ? "bg-[#00BFA5] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </Link>
                );
                return acc;
              }, [])}
          </div>

          <Link
            href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : "#"}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              currentPage < totalPages
                ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
                : "text-slate-400 cursor-not-allowed pointer-events-none"
            }`}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {filteredBreeders.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          <p className="text-lg font-semibold">No breeders found.</p>
          <p className="mt-2">Try adjusting your filters or searching a nearby town.</p>
        </div>
      )}
    </section>
  );
}
