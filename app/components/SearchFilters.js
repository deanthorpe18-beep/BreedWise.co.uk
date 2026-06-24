"use client";

import { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

const DEFAULT_FILTERS = {
  maxDistance: 50,
  healthTesting: null,
  kennelClub: null,
  councilLicence: null,
  availableOnly: false,
};

export default function SearchFilters({ onFiltersChange, breeders, initialFilters = {}, lockedFilters = {} }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters });

  useEffect(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
  }, [initialFilters]);

  const handleFilterChange = (key, value) => {
    if (lockedFilters[key]) return;
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const reset = { ...DEFAULT_FILTERS, ...initialFilters };
    setFilters(reset);
    onFiltersChange(reset);
  };

  const activeFilterCount = Object.entries(filters).filter(([key, v]) => {
    if (lockedFilters[key]) return false;
    const initial = initialFilters[key];
    if (key === "maxDistance") return v !== (initial ?? DEFAULT_FILTERS.maxDistance);
    if (key === "availableOnly") return v === true && !initial;
    return v !== (initial ?? null);
  }).length;

  const isLocked = (key) => !!lockedFilters[key];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center justify-between w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <span className="flex items-center gap-2">
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-[#00BFA5] px-2 py-0.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 transition ${showFilters ? "rotate-180" : ""}`} />
      </button>

      {showFilters && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(e) => handleFilterChange("availableOnly", e.target.checked)}
                disabled={isLocked("availableOnly")}
                className="accent-[#00BFA5] rounded disabled:opacity-50"
              />
              <span className="text-sm font-semibold text-slate-900">
                Available now only
                {isLocked("availableOnly") && <span className="ml-2 text-xs font-normal text-slate-400">(from search URL)</span>}
              </span>
            </label>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Maximum distance: <span className="text-[#00BFA5]">{filters.maxDistance} mi</span>
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={filters.maxDistance}
              onChange={(e) => handleFilterChange("maxDistance", parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00BFA5]"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>5 mi</span>
              <span>100 mi</span>
            </div>
          </div>

          {[
            { key: "healthTesting", label: "Health testing" },
            { key: "kennelClub", label: "Kennel club registration" },
            { key: "councilLicence", label: "Council licence holder" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                {label}
                {isLocked(key) && <span className="ml-2 text-xs font-normal text-slate-400">(from search URL)</span>}
              </label>
              <div className="space-y-2">
                {[
                  { value: null, label: "Any status" },
                  { value: "yes", label: "✓ Confirmed" },
                  { value: "no", label: "Not confirmed" },
                ].map((option) => (
                  <label key={String(option.value)} className={`flex items-center gap-3 ${isLocked(key) ? "opacity-60" : "cursor-pointer"}`}>
                    <input
                      type="radio"
                      name={key}
                      checked={filters[key] === option.value}
                      onChange={() => handleFilterChange(key, option.value)}
                      disabled={isLocked(key)}
                      className="accent-[#00BFA5]"
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear extra filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export { DEFAULT_FILTERS };
