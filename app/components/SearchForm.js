"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Crosshair, Loader2, Dog, Cat, Bird, Fish, X, ChevronDown } from "lucide-react";
import { saveSearch } from "./RecentSearches";

const ANIMAL_TYPES = [
  { value: "", label: "All animals", icon: Dog },
  { value: "dog", label: "Dogs", icon: Dog },
  { value: "cat", label: "Cats", icon: Cat },
  { value: "bird", label: "Birds", icon: Bird },
  { value: "fish", label: "Fish", icon: Fish },
  { value: "reptile", label: "Reptiles", icon: Fish },
  { value: "small-pet", label: "Small Pets", icon: Cat },
];

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
  initialBreeds = [],
  initialAnimal = "",
  initialMaxDistance = "",
  initialSort = "relevance",
  initialUserLat = "",
  initialUserLng = "",
  variant = "default",
}) {
  const router = useRouter();
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [animal, setAnimal] = useState(initialAnimal);
  const [selectedBreeds, setSelectedBreeds] = useState(initialBreeds);
  const [breedOptions, setBreedOptions] = useState([]);
  const [breedDropdownOpen, setBreedDropdownOpen] = useState(false);
  const [maxDistance, setMaxDistance] = useState(initialMaxDistance);
  const [sortBy, setSortBy] = useState(initialSort);
  const [userLat, setUserLat] = useState(initialUserLat);
  const [userLng, setUserLng] = useState(initialUserLng);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  // Fetch breeds when animal type changes
  useEffect(() => {
    if (!animal) {
      setBreedOptions([]);
      setSelectedBreeds([]); // Clear stale breeds when switching to "All animals"
      return;
    }
    setLoadingBreeds(true);
    fetch(`/api/breeds?animal=${encodeURIComponent(animal)}`)
      .then((res) => res.json())
      .then((data) => {
        setBreedOptions(data.breeds || []);
        setLoadingBreeds(false);
      })
      .catch(() => setLoadingBreeds(false));
  }, [animal]);

  const hasCriteria = !!(selectedBreeds.length > 0 || locationQuery.trim() || userLat || animal);

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

  const addBreed = (breedName) => {
    if (!breedName || selectedBreeds.includes(breedName)) return;
    setSelectedBreeds((prev) => [...prev, breedName]);
    setBreedDropdownOpen(false);
  };

  const removeBreed = (breedName) => {
    setSelectedBreeds((prev) => prev.filter((b) => b !== breedName));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!hasCriteria) return;
    const query = new URLSearchParams();
    const loc = locationQuery.trim() && locationQuery !== "My location" ? locationQuery.trim() : "";
    if (loc) query.set("q", loc);
    if (animal) query.set("animal", animal);
    selectedBreeds.forEach((b) => query.append("breed", b));
    if (maxDistance) query.set("maxDistance", maxDistance);
    if (sortBy && sortBy !== "relevance") query.set("sort", sortBy);
    if (userLat) query.set("userLat", userLat);
    if (userLng) query.set("userLng", userLng);
    saveSearch({ animal, breeds: selectedBreeds, location: loc, timestamp: new Date().toISOString() });
    router.push(`/search?${query.toString()}`);
  };

  const isHero = variant === "hero";
  const AnimalIcon = ANIMAL_TYPES.find((a) => a.value === animal)?.icon || Dog;

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
        <label htmlFor="location" className={`text-sm font-semibold text-slate-700`}>
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

      {/* Animal Type selector */}
      <div className="space-y-2">
        <label htmlFor="animal" className="text-sm font-semibold text-slate-700">
          Animal type
        </label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {ANIMAL_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = animal === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  setAnimal(type.value);
                  setSelectedBreeds([]);
                }}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-xs font-semibold transition ${
                  isActive
                    ? "border-[#00BFA5] bg-[#E6FFFB] text-[#00BFA5]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-breed selector */}
      {animal && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <AnimalIcon className="h-4 w-4 text-[#00BFA5]" />
              Select breeds
            </span>
          </label>

          {/* Breed chips */}
          {selectedBreeds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedBreeds.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 rounded-full bg-[#E6FFFB] px-3 py-1.5 text-sm font-medium text-[#00BFA5]"
                >
                  {b}
                  <button
                    type="button"
                    onClick={() => removeBreed(b)}
                    className="rounded-full p-0.5 hover:bg-[#00BFA5]/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Breed dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setBreedDropdownOpen(!breedDropdownOpen)}
              disabled={loadingBreeds}
              className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:opacity-50"
            >
              <span>{loadingBreeds ? "Loading breeds..." : "Add a breed..."}</span>
              <ChevronDown className={`h-4 w-4 transition ${breedDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {breedDropdownOpen && breedOptions.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-lg">
                {breedOptions
                  .filter((b) => !selectedBreeds.includes(b))
                  .map((breedName) => (
                    <button
                      key={breedName}
                      type="button"
                      onClick={() => addBreed(breedName)}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-[#E6FFFB] hover:text-[#00BFA5]"
                    >
                      {breedName}
                    </button>
                  ))}
                {breedOptions.filter((b) => !selectedBreeds.includes(b)).length === 0 && (
                  <p className="px-4 py-2 text-sm text-slate-400">All breeds selected</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Distance + Sort row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="maxDistance" className="text-sm font-semibold text-slate-700">
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
          <label htmlFor="sortBy" className="text-sm font-semibold text-slate-700">
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

      {/* Search button */}
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
        {hasCriteria ? "Search breeders" : "Select an animal type, breed, or location"}
      </button>

      {!hasCriteria && (
        <p className="text-center text-xs text-slate-400">
          Pick cats, fish, or another animal type — or add a breed or location to narrow results
        </p>
      )}
    </form>
  );
}
