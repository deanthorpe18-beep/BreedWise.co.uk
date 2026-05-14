"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Star, Heart, Globe, ChevronRight, Layers, Image as ImageIcon } from "lucide-react";
import SearchFilters from "./SearchFilters";
import { trackSearch, trackFilterUsage, trackSaveBreeder } from "@lib/analytics";

function formatDistance(distance) {
  return distance === null || distance === undefined ? "—" : `${distance} mi`;
}

function applyFilters(breeders, filters) {
  return breeders.filter((breeder) => {
    // Distance filter
    if (breeder.distance !== null && breeder.distance > filters.maxDistance) {
      return false;
    }

    // Rating filter
    if (breeder.google_rating.value < filters.minRating) {
      return false;
    }

    // Health testing filter
    if (filters.healthTesting !== null) {
      const hasHealthTesting = breeder.health_testing.value === "Yes";
      if (filters.healthTesting === "yes" && !hasHealthTesting) return false;
      if (filters.healthTesting === "no" && hasHealthTesting) return false;
    }

    // Kennel Club filter
    if (filters.kennelClub !== null) {
      const hasKC = breeder.kennel_club.value === "Yes";
      if (filters.kennelClub === "yes" && !hasKC) return false;
      if (filters.kennelClub === "no" && hasKC) return false;
    }

    // Council Licence filter
    if (filters.councilLicence !== null) {
      const hasLicence = breeder.council_licence.value === "Yes";
      if (filters.councilLicence === "yes" && !hasLicence) return false;
      if (filters.councilLicence === "no" && hasLicence) return false;
    }

    return true;
  });
}

export default function SearchResults({ breeders, query, breed }) {
  const [mapView, setMapView] = useState(false);
  const [saved, setSaved] = useState([]);
  const [filters, setFilters] = useState({
    maxDistance: 50,
    minRating: 0,
    healthTesting: null,
    kennelClub: null,
    councilLicence: null
  });
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("breedwise-saved") || "[]";
    setSaved(JSON.parse(stored));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("breedwise-saved", JSON.stringify(saved));
  }, [saved]);

  // Track search on first render
  useEffect(() => {
    if (!tracked && breeders.length > 0) {
      trackSearch(query, breed, filteredBreeders.length);
      setTracked(true);
    }
  }, []);

  const toggleSave = (slug, breederName) => {
    setSaved((current) => {
      const isAdding = !current.includes(slug);
      if (isAdding) {
        trackSaveBreeder(slug, breederName);
      }
      return isAdding ? [...current, slug] : current.filter((item) => item !== slug);
    });
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    trackFilterUsage(newFilters);
  };

  const filteredBreeders = useMemo(() => {
    return applyFilters(breeders, filters);
  }, [breeders, filters]);

  const mapPoints = useMemo(() => {
    if (!filteredBreeders.length) return [];
    const minLat = Math.min(...filteredBreeders.map((item) => item.coordinates.lat));
    const maxLat = Math.max(...filteredBreeders.map((item) => item.coordinates.lat));
    const minLng = Math.min(...filteredBreeders.map((item) => item.coordinates.lng));
    const maxLng = Math.max(...filteredBreeders.map((item) => item.coordinates.lng));

    return filteredBreeders.map((item) => {
      const x = maxLng === minLng ? 50 : ((item.coordinates.lng - minLng) / (maxLng - minLng)) * 100;
      const y = maxLat === minLat ? 50 : ((maxLat - item.coordinates.lat) / (maxLat - minLat)) * 100;
      return { slug: item.slug, x, y, name: item.name.value };
    });
  }, [filteredBreeders]);

  return (
    <section className="space-y-6">
      <SearchFilters onFiltersChange={handleFiltersChange} breeders={breeders} />

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Results</p>
          <h2 className="text-2xl font-semibold text-slate-900">{filteredBreeders.length} breeders found</h2>
          <p className="text-sm text-slate-500">Showing matches for <span className="font-semibold text-slate-700">{query || "West Sussex"}</span>{breed ? ` · ${breed}` : ""}</p>
        </div>
        <div className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${mapView ? "bg-white text-slate-900" : "text-slate-500"}`}
            onClick={() => setMapView(false)}
          >
            <Layers className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${mapView ? "text-slate-900" : "text-slate-500"}`}
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
          <p className="mt-4 text-sm text-slate-500">Map markers show approximate public listing locations within West Sussex.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBreeders.map((breeder) => (
            <div key={breeder.slug} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                {/* Left section - Main info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold text-slate-900">{breeder.name.value}</h3>
                    <p className="text-sm text-slate-600">{breeder.town.value}, {breeder.county.value}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">{formatDistance(breeder.distance)}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">{breeder.google_rating.value} ★</span>
                    {breeder.breeds.slice(0, 3).map((item) => (
                      <span key={item.name} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">{item.name}</span>
                    ))}
                  </div>

                  {/* Image gallery placeholder */}
                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Images from Google (coming soon)</p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <Link href={`/breeder/${breeder.slug}`} className="rounded-3xl bg-[#00BFA5] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#00a98e]">
                      View profile
                    </Link>
                    <a href={`tel:${breeder.phone.value}`} className="rounded-3xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      Call
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleSave(breeder.slug, breeder.name.value)}
                      className="rounded-3xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {saved.includes(breeder.slug) ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>

                {/* Right section - Details */}

                <div className="grid gap-3 min-w-[180px] text-sm text-slate-600">
                  <div className="rounded-3xl bg-[#F1F4F6] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Public info</p>
                    <p className="mt-2">KC: {breeder.kennel_club.value}</p>
                    <p>Council licence: {breeder.council_licence.value}</p>
                    <p>Health testing: {breeder.health_testing.value}</p>
                  </div>
                  <div className="rounded-3xl bg-[#F1F4F6] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Last updated</p>
                    <p className="mt-2 font-semibold text-slate-900">{breeder.last_updated_at}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
