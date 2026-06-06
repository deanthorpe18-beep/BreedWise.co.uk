"use client";

import { useState } from "react";
import Link from "next/link";
import { UserCheck, X, ShieldCheck, CheckCircle } from "lucide-react";

export default function ClaimProfileButton({
  breederSlug,
  breederName,
  variant = "button",
  isClaimed = false,
}) {
  const [showModal, setShowModal] = useState(false);
  const claimUrl = `/claim?slug=${encodeURIComponent(breederSlug)}&name=${encodeURIComponent(breederName)}`;

  if (variant === "banner") {
    if (isClaimed) {
      return (
        <div className="rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-r from-[#E6FFFB] to-[#F0FDFA] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#00BFA5]">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 flex items-center gap-2">
                Verified Profile
              </p>
              <p className="mt-1 text-sm text-slate-600">
                This listing has been claimed and verified by the breeder.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="rounded-3xl border border-[#00BFA5]/30 bg-gradient-to-r from-[#E6FFFB] to-[#F0FDFA] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#00BFA5]">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Are you the owner of {breederName}?</p>
                <p className="mt-1 text-sm text-slate-600">
                  Claim your profile to update information, respond to reviews, and improve your listing.
                </p>
              </div>
            </div>
            <Link
              href={claimUrl}
              className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
            >
              <UserCheck className="h-4 w-4" />
              Claim this profile
            </Link>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Claim your profile</h3>
                <button onClick={() => setShowModal(false)} className="rounded-full p-1 hover:bg-slate-100">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                To claim <strong>{breederName}</strong>, you need to log in and submit a verification request. Our team will review your claim within 1–2 working days.
              </p>
              <div className="mt-5 flex gap-3">
                <Link
                  href={claimUrl}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00a98e]"
                >
                  <UserCheck className="h-4 w-4" />
                  Start claim
                </Link>
                <button
                  onClick={() => setShowModal(false)}
                  className="inline-flex flex-1 items-center justify-center rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (isClaimed) return null;

  return (
    <Link
      href={claimUrl}
      className="inline-flex items-center gap-2 rounded-3xl border border-[#00BFA5] bg-white px-5 py-3 text-sm font-semibold text-[#00BFA5] shadow-sm transition hover:bg-[#E6FFFB]"
    >
      <UserCheck className="h-4 w-4" />
      Claim this profile
    </Link>
  );
}
