"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@components/AuthProvider";
import { Eye, Loader2 } from "lucide-react";
import TierUpgradeCards from "@components/TierUpgradeCards";

export default function BreederProfileOwnerPanel({ breederId, breederSlug, membershipTier }) {
  const { user } = useAuth();
  const [views, setViews] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/breeder/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.breeder?.id === breederId) {
          setIsOwner(true);
          return fetch("/api/breeder/analytics");
        }
        return null;
      })
      .then((r) => (r ? r.json() : null))
      .then((data) => {
        if (data?.summary) setViews(data.summary.page_views);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, breederId]);

  if (!user || loading || !isOwner) return null;

  const isFree = !membershipTier || membershipTier === "free" || membershipTier === "unclaimed";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#00BFA5]/30 bg-gradient-to-r from-[#E6FFFB] to-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#00BFA5]">Your listing insights</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
              <Eye className="h-6 w-6 text-[#00BFA5]" />
              {views !== null ? views.toLocaleString() : "—"} profile views
              <span className="text-sm font-normal text-slate-500">last 30 days</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Track full analytics in your{" "}
              <a href="/breeder/dashboard" className="font-semibold text-[#00BFA5] hover:underline">dashboard</a>.
            </p>
          </div>
          {isFree && (
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#00BFA5] shadow-sm border border-[#00BFA5]/20">
              Free plan — upgrade to rank higher
            </span>
          )}
        </div>
      </div>

      {isFree && (
        <TierUpgradeCards breederId={breederId} breederSlug={breederSlug} currentTier={membershipTier || "free"} compact />
      )}
    </div>
  );
}
