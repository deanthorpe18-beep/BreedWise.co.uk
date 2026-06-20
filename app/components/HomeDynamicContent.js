"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Star, Heart, MapPin, PawPrint, TrendingUp, ArrowRight, Sparkles, BookOpen } from "lucide-react";

export default function HomeDynamicContent() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/public/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const breederCount = stats?.breederCount?.toLocaleString() || "1,632";
  const breedCount = stats?.breedCount ? stats.breedCount.toLocaleString() : "200+";
  const trending = stats?.trendingBreeds?.length
    ? stats.trendingBreeds
    : [
        { breed: "Labrador Retriever" },
        { breed: "French Bulldog" },
        { breed: "Cocker Spaniel" },
      ];
  const towns = stats?.popularTowns?.length
    ? stats.popularTowns
    : [
        { town: "London", count: 0 },
        { town: "Birmingham", count: 0 },
        { town: "Manchester", count: 0 },
        { town: "Leeds", count: 0 },
        { town: "Bristol", count: 0 },
        { town: "Glasgow", count: 0 },
        { town: "Cardiff", count: 0 },
        { town: "Edinburgh", count: 0 },
        { town: "Liverpool", count: 0 },
        { town: "Sheffield", count: 0 },
        { town: "Newcastle", count: 0 },
        { town: "Belfast", count: 0 },
      ];

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 md:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#E6FFFB]">
                <Shield className="h-5 w-5 text-[#00BFA5]" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{breederCount}</p>
                <p className="text-sm text-slate-500">Active breeder listings</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FFF5F0]">
                <BookOpen className="h-5 w-5 text-[#FF6B6B]" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{breedCount}</p>
                <p className="text-sm text-slate-500">Breeds in our encyclopedia</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">Real reviews</p>
                <p className="text-sm text-slate-500">From Google Places</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-50">
                <Heart className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">Multi-pet</p>
                <p className="text-sm text-slate-500">Dogs, cats, birds &amp; more</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F1F4F6]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-5 w-5 text-[#00BFA5]" />
            <h2 className="text-2xl font-bold text-slate-900">Trending searches</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.slice(0, 6).map((item, i) => (
              <Link
                key={item.breed}
                href={`/search?breed=${encodeURIComponent(item.breed)}`}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-[#00BFA5]/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6FFFB]">
                      <PawPrint className="h-5 w-5 text-[#00BFA5]" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.breed}</p>
                      <p className="text-xs text-slate-500">Popular with buyers</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#00BFA5]/10 px-2.5 py-0.5 text-xs font-semibold text-[#00BFA5]">
                    #{i + 1}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#00BFA5] opacity-0 transition group-hover:opacity-100">
                  Search breeders <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Popular locations</h3>
            <p className="mt-1 text-sm text-slate-500">Search pet breeders in major UK cities</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {towns.slice(0, 12).map(({ town, count }) => (
              <Link
                key={town}
                href={`/search?q=${encodeURIComponent(town)}`}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:bg-[#E6FFFB] hover:text-[#00BFA5]"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {town}
                </span>
                <Sparkles className="h-3 w-3 text-slate-300 group-hover:text-[#00BFA5]" />
              </Link>
            ))}
          </div>
          <Link href="/near-me" className="inline-flex items-center gap-1 text-sm font-semibold text-[#00BFA5] hover:text-[#008f7a]">
            Find breeders near me <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </>
  );
}
