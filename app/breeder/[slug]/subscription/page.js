"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, CreditCard, Loader2, ArrowLeft } from "lucide-react";

export default function SubscriptionPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";
  const [portalLoading, setPortalLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href={`/breeder/${slug}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to profile
      </Link>

      {success && (
        <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
          <h1 className="mt-4 text-2xl font-bold text-green-800">Welcome to your new plan!</h1>
          <p className="mt-2 text-green-700">
            Your subscription is active. You can now enjoy all the benefits of your upgraded plan.
          </p>
        </div>
      )}

      {canceled && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h1 className="mt-4 text-2xl font-bold text-slate-800">Checkout canceled</h1>
          <p className="mt-2 text-slate-600">
            No worries — you can upgrade anytime from your dashboard.
          </p>
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[#00BFA5]" />
          Subscription Management
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your plan, payment method, and billing history.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Current plan</p>
              <p className="text-lg font-bold text-slate-900 capitalize">
                {profile?.membershipTier || "Free"}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              profile?.membershipTier === "free" ? "bg-[#E6FFFB] text-[#00BFA5]" :
              profile?.membershipTier === "bronze" ? "bg-orange-50 text-orange-600" :
              profile?.membershipTier === "silver" ? "bg-slate-100 text-slate-600" :
              "bg-amber-50 text-amber-600"
            }`}>
              {profile?.membershipTier === "free" ? "Free" :
               profile?.membershipTier === "bronze" ? "Bronze" :
               profile?.membershipTier === "silver" ? "Silver" : "Gold"}
            </span>
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
    </div>
  );
}
