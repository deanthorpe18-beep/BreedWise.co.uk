"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronDown, MapPin, Building2 } from "lucide-react";

export default function BreederSearchDropdown({ value, onChange, disabled, selectedName }) {
  const [breeders, setBreeders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/breeders/names?limit=2000")
      .then((r) => r.json())
      .then((data) => {
        setBreeders(data.breeders || []);
      })
      .catch(() => setBreeders([]))
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedBreeder = breeders.find((b) => b.slug === value);

  const filtered = breeders.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.town?.toLowerCase().includes(q) ||
      b.slug?.toLowerCase().includes(q)
    );
  });

  const handleSelect = useCallback((breeder) => {
    onChange(breeder.slug, breeder.name);
    setSearch("");
    setOpen(false);
  }, [onChange]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-sm transition ${
          disabled
            ? "border-slate-100 bg-slate-50 text-slate-400"
            : "border-slate-200 bg-white text-slate-900 hover:border-[#00BFA5]"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedBreeder || (value && selectedName) ? (
            <>
              <Building2 className="h-4 w-4 flex-shrink-0 text-[#00BFA5]" />
              <span className="truncate">{selectedBreeder?.name || selectedName}</span>
              {selectedBreeder?.town && (
                <span className="text-xs text-slate-400 flex-shrink-0">
                  <MapPin className="inline h-3 w-3 mr-0.5" />
                  {selectedBreeder.town}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400">Search and select your breeder profile...</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg">
          {/* Search input */}
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type breeder name, town, or slug..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#00BFA5]"
              />
            </div>
          </div>

          {/* Results list */}
          <div className="max-h-72 overflow-y-auto p-1">
            {loading ? (
              <div className="py-4 text-center text-sm text-slate-400">Loading breeders...</div>
            ) : filtered.length === 0 ? (
              <div className="py-4 text-center text-sm text-slate-400">
                {search ? "No breeders found." : "Start typing to search..."}
              </div>
            ) : (
              filtered.slice(0, 100).map((breeder) => (
                <button
                  key={breeder.slug}
                  type="button"
                  onClick={() => handleSelect(breeder)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-[#E6FFFB] ${
                    value === breeder.slug ? "bg-[#E6FFFB]" : ""
                  }`}
                >
                  <Building2 className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{breeder.name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {breeder.town}{breeder.county ? `, ${breeder.county}` : ""}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer count */}
          <div className="border-t border-slate-100 px-3 py-2 text-xs text-slate-400">
            {filtered.length.toLocaleString()} breeder{filtered.length !== 1 ? "s" : ""} found
            {search && ` for "${search}"`}
          </div>
        </div>
      )}
    </div>
  );
}
