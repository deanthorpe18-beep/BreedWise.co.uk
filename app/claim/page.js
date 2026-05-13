"use client";

import { useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";

export default function ClaimPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Claim listing</p>
          <h1 className="text-3xl font-semibold text-slate-900">Claim your breeder profile</h1>
          <p className="text-sm leading-6 text-slate-600">Submit your email and receive a magic link. An admin review step is required before your listing is marked as claimed.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
          <div className="flex items-center gap-3 text-slate-700">
            <ShieldCheck className="h-5 w-5 text-[#00BFA5]" />
            <p className="text-sm font-semibold">Phase 1: password-free email magic link login</p>
          </div>
          <p className="mt-3 text-sm text-slate-600">SMS verification support is designed for future rollout but is not active yet.</p>
        </div>

        {submitted ? (
          <div className="rounded-3xl border border-[#00BFA5] bg-[#E6FFFB] p-6 text-slate-800">
            <p className="font-semibold">Claim request sent</p>
            <p className="mt-2">We’ll send your magic link to {email}. An admin will review your claim before it is approved.</p>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <label className="block text-sm font-semibold text-slate-700">
              Email address
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
              />
            </label>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]">
              <Mail className="h-4 w-4" /> Send magic link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
