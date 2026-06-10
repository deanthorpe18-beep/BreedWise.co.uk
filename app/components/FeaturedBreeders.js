"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, MapPin, Image as ImageIcon, RefreshCw } from "lucide-react";

export default function FeaturedBreeders() {
  const [breeders, setBreeders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotateTick, setRotateTick] = useState(0);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/featured-breeders?page=home");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setBreeders(data.breeders || []);
      } catch (err) {
        console.error("Error fetching featured breeders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  // Auto-rotate indicator tick every 5 seconds
  useEffect(() => {
    if (breeders.length === 0) return;
    const interval = setInterval(() => {
      setRotateTick((t) => (t + 1) % breeders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [breeders.length]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900">Featured Breeders</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-100 h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (breeders.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900">Featured Breeders</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">Rotating</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {breeders.map((breeder, idx) => (
          <Link
            key={breeder.id}
            href={`/breeder/${breeder.slug}`}
            className="group relative block rounded-2xl border border-slate-200 bg-white overflow-hidden transition hover:shadow-md hover:border-amber-200"
          >
            {/* Hero image */}
            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
              {breeder.hero_image_url ? (
                <img
                  src={breeder.hero_image_url}
                  alt={`${breeder.name} — featured breeder`}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = "none";
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
                style={{ display: breeder.hero_image_url ? "none" : "flex" }}
              >
                <ImageIcon className="h-8 w-8 text-slate-400" />
              </div>

              {/* Gold badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                  <Crown className="h-3 w-3" />
                  Gold
                </span>
              </div>

              {/* Rotation indicator dot */}
              <div className="absolute top-3 right-3 flex gap-1">
                {breeders.map((_, dotIdx) => (
                  <span
                    key={dotIdx}
                    className={`h-1.5 w-1.5 rounded-full transition ${
                      dotIdx === rotateTick ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 group-hover:text-amber-700 transition line-clamp-1">
                {breeder.name}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {breeder.town}
                {breeder.county ? `, ${breeder.county}` : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
