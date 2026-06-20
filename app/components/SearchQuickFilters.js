"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, Shield, Award, Heart, GitCompare } from "lucide-react";

const FILTERS = [
  { key: "available", label: "Available now", icon: Calendar },
  { key: "verified", label: "Verified licensed", icon: Shield },
  { key: "licensed", label: "Council licensed", icon: Shield },
  { key: "kc", label: "KC registered", icon: Award },
  { key: "health", label: "Health tested", icon: Heart },
];

function buildUrl(searchParams, toggleKey) {
  const params = new URLSearchParams(searchParams.toString());
  if (params.get(toggleKey) === "1") {
    params.delete(toggleKey);
  } else {
    params.set(toggleKey, "1");
  }
  params.delete("page");
  return `/search?${params.toString()}`;
}

export default function SearchQuickFilters() {
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">Quick filters</span>
      {FILTERS.map(({ key, label, icon: Icon }) => {
        const active = searchParams.get(key) === "1";
        return (
          <Link
            key={key}
            href={buildUrl(searchParams, key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "border-[#00BFA5] bg-[#E6FFFB] text-[#00BFA5]"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#00BFA5]/40 hover:bg-[#E6FFFB]/50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
      <Link
        href="/account/compare"
        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
      >
        <GitCompare className="h-3.5 w-3.5" />
        Compare saved
      </Link>
    </div>
  );
}
