"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { getBreeds } from "@lib/breeders";

export default function SearchForm({ initialLocation = "", initialBreed = "" }) {
  const router = useRouter();
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [breed, setBreed] = useState(initialBreed);
  const breeds = getBreeds();

  return (
    <form
      className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const query = new URLSearchParams();
        if (locationQuery.trim()) query.set("q", locationQuery.trim());
        if (breed) query.set("breed", breed);
        router.push(`/search?${query.toString()}`);
      }}
    >
      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-semibold text-slate-700">
          Enter town or postcode
        </label>
        <div className="relative rounded-3xl border border-slate-200 bg-[#F1F4F6] px-4 py-3 shadow-sm focus-within:border-[#00BFA5] focus-within:ring-2 focus-within:ring-[#00BFA5]/20">
          <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="location"
            className="w-full rounded-3xl border-none bg-transparent pl-11 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            value={locationQuery}
            onChange={(event) => setLocationQuery(event.target.value)}
            placeholder="Enter town or postcode"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="breed" className="text-sm font-semibold text-slate-700">
          Optional breed filter
        </label>
        <select
          id="breed"
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
          value={breed}
          onChange={(event) => setBreed(event.target.value)}
        >
          <option value="">All breeds</option>
          {breeds.map((breedName) => (
            <option key={breedName} value={breedName}>
              {breedName}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
      >
        <Search className="h-4 w-4" />
        Search breeders
      </button>
    </form>
  );
}
