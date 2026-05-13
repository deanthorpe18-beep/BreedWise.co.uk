"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";

export default function SuggestEditPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-900">
          <Edit3 className="h-5 w-5 text-[#00BFA5]" />
          <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Suggest an edit</p>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">Help us keep listings accurate</h1>
        {submitted ? (
          <div className="rounded-3xl border border-[#00BFA5] bg-[#E6FFFB] p-6 text-slate-800">
            <p className="font-semibold">Thanks for your suggestion</p>
            <p className="mt-2">We’ll review your request and update the listing if appropriate.</p>
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
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Suggestion details
              <textarea
                required
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={6}
                placeholder="Describe which listing should be updated and why."
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
              />
            </label>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]">
              Submit suggestion
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
