"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, X } from "lucide-react";

const STORAGE_KEY = "breedwise-recent-searches";
const MAX_RECENT = 5;

export function getRecentSearches() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveSearch(search) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter(
      (s) =>
        s.breed !== search.breed ||
        s.location !== search.location ||
        (s.breederName || "") !== (search.breederName || "")
    );
    const updated = [search, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export default function RecentSearches() {
  const [searches, setSearches] = useState([]);

  useEffect(() => {
    setSearches(getRecentSearches());
  }, []);

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSearches([]);
  };

  const removeOne = (index) => {
    const updated = searches.filter((_, i) => i !== index);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSearches(updated);
  };

  if (searches.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recent searches</p>
        <button onClick={clearAll} className="text-xs text-slate-400 hover:text-red-500 transition">
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((s, i) => {
          const params = new URLSearchParams();
          if (s.location) params.set("q", s.location);
          if (s.breederName) params.set("name", s.breederName);
          if (s.breed) params.set("breed", s.breed);
          const label =
            [s.breederName, s.breed, s.location].filter(Boolean).join(" · ") || "Search";
          return (
            <div key={i} className="group inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-[#00BFA5]">
              <Link href={`/search?${params.toString()}`} className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-400" />
                {label}
              </Link>
              <button onClick={() => removeOne(i)} className="ml-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
