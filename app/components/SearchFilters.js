"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

export default function SearchFilters({ onFiltersChange, breeders }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maxDistance: 50,
    healthTesting: null,
    kennelClub: null,
    councilLicence: null
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      maxDistance: 50,
      healthTesting: null,
      kennelClub: null,
      councilLicence: null
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== null && v !== 0 && v !== 50).length;

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
          {/* Distance Filter */}
          <div>
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

          {/* Health Testing Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">Health testing</label>
            <div className="space-y-2">
              {[
                { value: null, label: "Any status" },
                { value: "yes", label: "✓ Confirmed" },
                { value: "no", label: "Not confirmed" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="healthTesting"
                    value={option.value}
                    checked={filters.healthTesting === option.value}
                    onChange={(e) => handleFilterChange("healthTesting", e.target.value === "null" ? null : e.target.value)}
                    className="accent-[#00BFA5]"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Kennel Club Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">Kennel club registration</label>
            <div className="space-y-2">
              {[
                { value: null, label: "Any status" },
                { value: "yes", label: "✓ Registered" },
                { value: "no", label: "Not registered" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="kennelClub"
                    value={option.value}
                    checked={filters.kennelClub === option.value}
                    onChange={(e) => handleFilterChange("kennelClub", e.target.value === "null" ? null : e.target.value)}
                    className="accent-[#00BFA5]"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Council Licence Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">Council licence holder</label>
            <div className="space-y-2">
              {[
                { value: null, label: "Any status" },
                { value: "yes", label: "✓ Licensed" },
                { value: "no", label: "Not licensed" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="councilLicence"
                    value={option.value}
                    checked={filters.councilLicence === option.value}
                    onChange={(e) => handleFilterChange("councilLicence", e.target.value === "null" ? null : e.target.value)}
                    className="accent-[#00BFA5]"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
