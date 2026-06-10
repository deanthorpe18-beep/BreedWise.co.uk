"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Crosshair, Loader2, Dog } from "lucide-react";
import { saveSearch } from "./RecentSearches";

const DISTANCE_OPTIONS = [
  { value: "", label: "Any distance" },
  { value: "5", label: "Within 5 miles" },
  { value: "10", label: "Within 10 miles" },
  { value: "25", label: "Within 25 miles" },
  { value: "50", label: "Within 50 miles" },
  { value: "100", label: "Within 100 miles" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "distance", label: "Distance (nearest first)" },
  { value: "rating", label: "Highest rated first" },
  { value: "name", label: "Name (A–Z)" },
];

export default function SearchForm({
  initialLocation = "",
  initialBreed = "",
  initialMaxDistance = "",
  initialSort = "relevance",
  initialUserLat = "",
  initialUserLng = "",
  variant = "default", // "default" | "hero"
}) {
  const router = useRouter();
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [breed, setBreed] = useState(initialBreed);
  const [maxDistance, setMaxDistance] = useState(initialMaxDistance);
  const [sortBy, setSortBy] = useState(initialSort);
  const [userLat, setUserLat] = useState(initialUserLat);
  const [userLng, setUserLng] = useState(initialUserLng);
  const [breeds, setBreeds] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    fetch("/api/breeds")
      .then((res) => res.json())
      .then((data) => {
        setBreeds(data.breeds || []);
        setLoadingBreeds(false);
      })
      .catch(() => setLoadingBreeds(false));
  }, []);

  const hasCriteria = !!(breed || locationQuery.trim() || userLat);

  const handleGeolocation = useCallback(() => {
    setGeoLoading(true);
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setUserLat(lat);
        setUserLng(lng);
        setLocationQuery("My location");
        setGeoLoading(false);
      },
      (err) => {
        setGeoError("Unable to get your location. Please enter manually.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!hasCriteria) return;
    const query = new URLSearchParams();
    const loc = locationQuery.trim() && locationQuery !== "My location" ? locationQuery.trim() : "";
    if (loc) query.set("q", loc);
    if (breed) query.set("breed", breed);
    if (maxDistance) query.set("maxDistance", maxDistance);
    if (sortBy && sortBy !== "relevance") query.set("sort", sortBy);
    if (userLat) query.set("userLat", userLat);
    if (userLng) query.set("userLng", userLng);
    saveSearch({ breed, location: loc, timestamp: new Date().toISOString() });
    router.push(`/search?${query.toString()}`);
  };

  const isHero = variant === "hero";

  return (
    <form
      className={`space-y-4 ${
        isHero
          ? "rounded-3xl border border-white/20 bg-white/95 p-6 shadow-xl backdrop-blur-sm sm:p-8"
          : "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      }`}
      onSubmit={handleSubmit}
    >
      {/* Location input + geolocation */}
      <div className="space-y-2">
        <label htmlFor="location" className={`text-sm font-semibold ${isHero ? "text-slate-700" : "text-slate-700"}`}>
          Enter town or postcode
        </label>
        <div className={`relative rounded-3xl border px-4 py-3 shadow-sm focus-within:border-[#00BFA5] focus-within:ring-2 focus-within:ring-[#00BFA5]/20 ${
          isHero ? "border-slate-200 bg-white" : "border-slate-200 bg-[#F1F4F6]"
        }`}>
          <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="location"
            className="w-full rounded-3xl border-none bg-transparent pl-11 pr-28 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            value={locationQuery}
            onChange={(event) => {
              setLocationQuery(event.target.value);
              if (event.target.value !== "My location") {
                setUserLat("");
                setUserLng("");
              }
            }}
            placeholder="e.g. London, SW1A 1AA, Manchester"
          />
          <button
            type="button"
            onClick={handleGeolocation}
            disabled={geoLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#00BFA5] shadow-sm transition hover:bg-[#E6FFFB] disabled:opacity-50"
          >
            {geoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crosshair className="h-3 w-3" />}
            Use my location
          </button>
        </div>
        {geoError && <p className="text-xs text-red-600">{geoError}</p>}
        {userLat && userLng && (
          <p className="text-xs text-[#00BFA5]">Using your current location</p>
        )}
      </div>

      {/* Breed filter */}
      <div className="space-y-2">
        <label htmlFor="breed" className={`text-sm font-semibold ${isHero ? "text-slate-700" : "text-slate-700"}`}>
          <span className="inline-flex items-center gap-1.5">
            <Dog className="h-4 w-4 text-[#00BFA5]" />
            Select a breed
          </span>
        </label>
        <select
          id="breed"
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
          value={breed}
          onChange={(event) => setBreed(event.target.value)}
          disabled={loadingBreeds}
        >
          <option value="">Choose a breed...</option>
          {breeds.map((breedName) => (
            <option key={breedName} value={breedName}>
              {breedName}
            </option>
          ))}
        </select>
      </div>

      {/* Distance + Sort row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="maxDistance" className={`text-sm font-semibold ${isHero ? "text-slate-700" : "text-slate-700"}`}>
            Max distance
          </label>
          <select
            id="maxDistance"
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
            value={maxDistance}
            onChange={(event) => setMaxDistance(event.target.value)}
          >
            {DISTANCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="sortBy" className={`text-sm font-semibold ${isHero ? "text-slate-700" : "text-slate-700"}`}>
            Sort by
          </label>
          <select
            id="sortBy"
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search button — disabled until criteria entered */}
      <button
        type="submit"
        disabled={!hasCriteria}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-3xl px-5 py-4 text-sm font-semibold shadow-lg transition ${
          hasCriteria
            ? "bg-[#00BFA5] text-white shadow-[#00BFA5]/20 hover:bg-[#00a98e]"
            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
        }`}
      >
        <Search className="h-4 w-4" />
        {hasCriteria ? "Search breeders" : "Select a breed or location to search"}
      </button>

      {!hasCriteria && (
        <p className="text-center text-xs text-slate-400">
          Please select a breed or enter a location to find breeders
        </p>
      )}
    </form>
  );
}
