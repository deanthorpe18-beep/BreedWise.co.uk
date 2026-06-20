"use client";

import { Shield, Star, Heart, BookOpen } from "lucide-react";

export default function SocialProofBanner() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#E6FFFB]">
            <Shield className="h-5 w-5 text-[#00BFA5]" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">1,632</p>
            <p className="text-sm text-slate-500">Active breeder listings</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FFF5F0]">
            <BookOpen className="h-5 w-5 text-[#FF6B6B]" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">200+</p>
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
            <p className="text-lg font-bold text-slate-900">Buyer-first</p>
            <p className="text-sm text-slate-500">Independent directory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
