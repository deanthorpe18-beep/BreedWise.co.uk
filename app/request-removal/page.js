"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function RequestRemovalPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-900">
          <Trash2 className="h-5 w-5 text-[#FF6B6B]" />
          <p className="text-sm uppercase tracking-[0.3em] text-[#FF6B6B]">Request removal</p>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">Request removal of a listing</h1>
        {submitted ? (
          <div className="rounded-3xl border border-[#FF6B6B] bg-[#FFE9E9] p-6 text-slate-800">
            <p className="font-semibold">Request submitted</p>
            <p className="mt-2">We will review your removal request and act according to our directory policy.</p>
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
              Your email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Removal reason
              <textarea
                required
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={6}
                placeholder="Explain why this listing should be removed."
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
              />
            </label>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#FF6B6B] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#FF6B6B]/20 transition hover:bg-[#e65a5a]">
              Send removal request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
