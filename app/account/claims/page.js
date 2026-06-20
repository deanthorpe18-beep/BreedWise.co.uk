"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@components/AuthProvider";
import { Loader2, Shield, Clock, CheckCircle, XCircle, ArrowLeft, ExternalLink } from "lucide-react";

export default function MyClaimsPage() {
  const { user, loading: loadingUser } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch("/api/claims/mine")
      .then((r) => r.json())
      .then((data) => {
        setClaims(data.claims || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (loadingUser || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to view your claims</h1>
        <Link href="/auth/login?redirect=/account/claims" className="mt-6 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/account/settings" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Account settings
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">My Claims</h1>
      <p className="mt-1 text-sm text-slate-500">Track the status of your profile claims.</p>

      {claims.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <Shield className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">You have not submitted any claims yet.</p>
          <Link href="/claim" className="mt-4 inline-block rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#00a98e]">
            Claim a profile
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{claim.breeder_name}</h3>
                  <p className="text-xs text-slate-500">Submitted {new Date(claim.submitted_at).toLocaleDateString("en-GB")}</p>
                  {claim.admin_reason && (
                    <p className="mt-1 text-xs text-slate-500">Note: {claim.admin_reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={claim.status} />
                  {claim.status === "approved" && claim.breeder_slug && (
                    <Link
                      href={`/breeder/${claim.breeder_slug}`}
                      className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <ExternalLink className="h-3 w-3" /> View
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { icon: Clock, text: "Pending review", className: "bg-amber-50 text-amber-700" },
    under_review: { icon: Shield, text: "Under review", className: "bg-blue-50 text-blue-700" },
    approved: { icon: CheckCircle, text: "Approved", className: "bg-green-50 text-green-700" },
    rejected: { icon: XCircle, text: "Rejected", className: "bg-red-50 text-red-700" },
  };
  const { icon: Icon, text, className } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
}
