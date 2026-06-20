"use client";

import { useState } from "react";
import { Check, Loader2, Crown, Sparkles, Award } from "lucide-react";
import { TIER_CONFIG } from "@/lib/tiers";

const PAID_TIERS = ["bronze", "silver", "gold"];

const TIER_ICONS = { bronze: Award, silver: Sparkles, gold: Crown };
const TIER_COLORS = {
  bronze: "border-orange-200 bg-gradient-to-b from-orange-50 to-white",
  silver: "border-slate-300 bg-gradient-to-b from-slate-50 to-white",
  gold: "border-amber-300 bg-gradient-to-b from-amber-50 to-white ring-2 ring-amber-200/60",
};

export default function TierUpgradeCards({ breederId, breederSlug, currentTier = "free", compact = false }) {
  const [loadingTier, setLoadingTier] = useState(null);
  const [error, setError] = useState("");

  const isFree = !currentTier || currentTier === "free" || currentTier === "unclaimed";

  const handleUpgrade = async (tier) => {
    if (!breederId) return;
    setLoadingTier(tier);
    setError("");
    try {
      const res = await fetch("/api/stripe/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breederId, tier }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Unable to start checkout.");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoadingTier(null);
  };

  if (!isFree && !compact) {
    return (
      <div className="rounded-3xl border border-[#00BFA5]/30 bg-[#E6FFFB]/50 p-5">
        <p className="text-sm font-semibold text-[#008f7a]">
          You are on the {TIER_CONFIG[currentTier]?.name || currentTier} plan.
        </p>
        <a
          href={breederSlug ? `/breeder/${breederSlug}/subscription` : "/account/subscription"}
          className="mt-2 inline-block text-sm font-semibold text-[#00BFA5] hover:underline"
        >
          Manage subscription →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isFree && (
        <div className="rounded-3xl border-2 border-dashed border-[#00BFA5]/40 bg-gradient-to-br from-[#E6FFFB] via-white to-[#FFF5F0] p-6 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-[#00BFA5]">Your current plan</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Free listing</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
            Your profile is live and searchable. Upgrade to appear higher in results, add more photos, unlock analytics, and build trust with a verified badge.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className={`grid gap-4 ${compact ? "sm:grid-cols-3" : "lg:grid-cols-3"}`}>
        {PAID_TIERS.map((tier) => {
          const config = TIER_CONFIG[tier];
          const Icon = TIER_ICONS[tier];
          const isCurrent = currentTier === tier;
          return (
            <div
              key={tier}
              className={`flex flex-col rounded-3xl border p-5 shadow-sm ${TIER_COLORS[tier]} ${tier === "silver" ? "relative" : ""}`}
            >
              {tier === "silver" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00BFA5] px-3 py-0.5 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${tier === "bronze" ? "text-orange-500" : tier === "gold" ? "text-amber-600" : "text-slate-600"}`} />
                <h4 className="text-lg font-bold text-slate-900">{config.name}</h4>
              </div>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                {config.price}
                <span className="text-sm font-normal text-slate-500">/mo</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {config.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00BFA5]" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={isCurrent || loadingTier !== null || !breederId}
                onClick={() => handleUpgrade(tier)}
                className={`mt-5 w-full rounded-3xl px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                  tier === "gold"
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : tier === "silver"
                      ? "bg-[#00BFA5] text-white hover:bg-[#00a98e]"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {loadingTier === tier ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : isCurrent ? (
                  "Current plan"
                ) : (
                  `Upgrade to ${config.name}`
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
