"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@components/AuthProvider";
import {
  Loader2, Heart, MapPin, Star, Phone, MessageCircle, CheckCircle, XCircle, Shield, Award, ArrowLeft, Scale, ExternalLink
} from "lucide-react";

export default function ComparePage() {
  const { user, loading } = useAuth();
  const [saved, setSaved] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/saved-breeders")
      .then((r) => r.json())
      .then((data) => {
        setSaved(data.saved || []);
        setLoadingData(false);
      })
      .catch(() => setLoadingData(false));
  }, [user]);

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const compared = saved.filter((s) => selected.includes(s.id));

  if (loading || loadingData) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to compare breeders</h1>
        <Link href="/auth/login?redirect=/account/compare" className="mt-6 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/account/saved-breeders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Saved breeders
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <Scale className="h-6 w-6 text-[#00BFA5]" />
        <h1 className="text-2xl font-bold text-slate-900">Compare Breeders</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">Select up to 3 saved breeders to compare side by side.</p>

      {/* Selector */}
      <div className="mt-6 flex flex-wrap gap-2">
        {saved.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition border ${
              selected.includes(item.id)
                ? "bg-[#00BFA5] text-white border-[#00BFA5]"
                : "bg-white text-slate-700 border-slate-200 hover:border-[#00BFA5]"
            }`}
          >
            {selected.includes(item.id) ? <CheckCircle className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
            {item.breeders?.name}
          </button>
        ))}
      </div>

      {saved.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No saved breeders</h2>
          <p className="mt-1 text-sm text-slate-500">Save breeders from search to compare them here.</p>
          <Link href="/search" className="mt-4 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white">
            Browse breeders
          </Link>
        </div>
      )}

      {/* Comparison table */}
      {compared.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Headers */}
            <div className="grid" style={{ gridTemplateColumns: `160px repeat(${compared.length}, 1fr)` }}>
              <div className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Feature</div>
              {compared.map((item) => (
                <div key={item.id} className="p-4 text-center">
                  <Link href={`/breeder/${item.breeders?.slug}`} className="text-sm font-bold text-slate-900 hover:text-[#00BFA5]">
                    {item.breeders?.name}
                  </Link>
                  <p className="text-xs text-slate-500">{item.breeders?.town}</p>
                </div>
              ))}
            </div>

            {/* Rows */}
            {[
              {
                label: "Location",
                render: (b) => (
                  <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {b.town}{b.county ? `, ${b.county}` : ""}
                  </span>
                ),
              },
              {
                label: "Rating",
                render: (b) =>
                  b.google_rating ? (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {b.google_rating} ({b.google_review_count || 0} reviews)
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  ),
              },
              {
                label: "Claimed",
                render: (b) =>
                  b.status === "claimed_profile" ? (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#00BFA5]">
                      <Shield className="h-4 w-4" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                      <XCircle className="h-4 w-4" /> Unclaimed
                    </span>
                  ),
              },
              {
                label: "Kennel Club",
                render: (b) => renderCheck(b.kennel_club),
              },
              {
                label: "Council Licence",
                render: (b) => renderCheck(b.council_licence),
              },
              {
                label: "Health Testing",
                render: (b) => renderCheck(b.health_testing),
              },
              {
                label: "Phone",
                render: (b) =>
                  b.phone ? (
                    <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1 text-sm text-[#00BFA5] font-semibold">
                      <Phone className="h-3.5 w-3.5" /> {b.phone}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  ),
              },
              {
                label: "Website",
                render: (b) =>
                  b.website ? (
                    <a href={b.website} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm text-[#00BFA5] font-semibold">
                      <ExternalLink className="h-3.5 w-3.5" /> Visit
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  ),
              },
              {
                label: "Membership",
                render: (b) => (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    b.membership_tier === "gold" ? "bg-amber-50 text-amber-600" :
                    b.membership_tier === "silver" ? "bg-slate-100 text-slate-600" :
                    b.membership_tier === "bronze" ? "bg-orange-50 text-orange-600" :
                    "bg-[#E6FFFB] text-[#00BFA5]"
                  }`}>
                    <Award className="h-3 w-3" />
                    {(b.membership_tier || "free").charAt(0).toUpperCase() + (b.membership_tier || "free").slice(1)}
                  </span>
                ),
              },
              {
                label: "Message",
                render: (b) =>
                  b.status === "claimed_profile" ? (
                    <Link href={`/breeder/${b.slug}`} className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 border border-purple-200">
                      <MessageCircle className="h-3 w-3" /> Enquire
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-400">No messaging</span>
                  ),
              },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`grid ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                style={{ gridTemplateColumns: `160px repeat(${compared.length}, 1fr)` }}
              >
                <div className="p-4 text-sm font-semibold text-slate-700 border-t border-slate-100">{row.label}</div>
                {compared.map((item) => (
                  <div key={item.id} className="p-4 text-center border-t border-slate-100 flex items-center justify-center">
                    {row.render(item.breeders)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderCheck(value) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700">
      <CheckCircle className="h-4 w-4" /> {value}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm text-slate-400">
      <XCircle className="h-4 w-4" /> Not listed
    </span>
  );
}
