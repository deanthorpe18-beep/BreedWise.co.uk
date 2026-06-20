"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@components/AuthProvider";
import { Loader2, CreditCard, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export default function AccountSubscriptionPage() {
  const { user, loading: userLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/breeder/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data.breeder || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openPortal = async () => {
    if (!profile?.id) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breederId: profile.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setPortalLoading(false);
    } catch {
      setPortalLoading(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to manage your subscription</h1>
        <Link href="/auth/login?redirect=/account/subscription" className="mt-6 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  const tier = profile?.membershipTier || "free";
  const tierLabel = tier === "free" ? "Free" : tier === "bronze" ? "Bronze" : tier === "silver" ? "Silver" : "Gold";
  const tierColor = tier === "free" ? "bg-[#E6FFFB] text-[#00BFA5]" :
    tier === "bronze" ? "bg-orange-50 text-orange-600" :
    tier === "silver" ? "bg-slate-100 text-slate-600" :
    "bg-amber-50 text-amber-600";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/account/settings" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Account settings
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">Subscription</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your plan, billing, and payment methods.</p>

      {profile ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#00BFA5]" />
            Plan details
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Current plan</p>
                <p className="text-lg font-bold text-slate-900 capitalize">{tierLabel}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tierColor}`}>
                {tierLabel}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">Plan benefits</p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00BFA5]" /> Profile listing on BreedWise</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00BFA5]" /> {tier === "free" ? "3 photos" : tier === "bronze" ? "5 photos" : tier === "silver" ? "10 photos" : "Unlimited photos"}</li>
                {tier !== "free" && (
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00BFA5]" /> Premium badge & priority placement</li>
                )}
              </ul>
            </div>

            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="w-full rounded-3xl bg-[#00BFA5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#00a98e] disabled:opacity-50"
            >
              {portalLoading ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Opening portal...</span>
              ) : (
                "Manage billing & subscription"
              )}
            </button>

            <Link
              href="/breeder/dashboard"
              className="block w-full rounded-3xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Go to breeder dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <XCircle className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No breeder profile linked to your account.</p>
          <Link href="/claim" className="mt-4 inline-block rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#00a98e]">
            Claim a profile
          </Link>
        </div>
      )}
    </div>
  );
}
