"use client";

import { useState } from "react";
import { Bell, CheckCircle, Loader2, Users } from "lucide-react";

export default function BreederWaitlistJoin({ breederSlug, breederName, breeds = [] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", breed_interest: "", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/breeders/${breederSlug}/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not join wait list.");
    else setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">You&apos;re on the wait list</p>
            <p className="mt-1 text-sm text-green-800">
              We&apos;ll email you at <strong>{form.email}</strong> when {breederName} announces a new litter on BreedWise.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
            <Users className="h-3.5 w-3.5" /> Wait list
          </div>
          <h2 className="mt-3 text-xl font-bold text-slate-900">Join the queue</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            No litter available right now? Join {breederName}&apos;s wait list and get an email when they announce pups or kittens.
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700"
          >
            <Bell className="h-4 w-4" /> Join wait list
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={submit} className="mt-6 space-y-4 border-t border-purple-100 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Your name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Email *</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Phone (optional)</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Breed interested in</span>
              {breeds.length > 0 ? (
                <select
                  value={form.breed_interest}
                  onChange={(e) => setForm({ ...form, breed_interest: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                  <option value="">Any from this breeder</option>
                  {breeds.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.breed_interest}
                  onChange={(e) => setForm({ ...form, breed_interest: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="e.g. Labrador"
                />
              )}
            </label>
          </div>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Message (optional)</span>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="Anything you'd like the breeder to know"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
              Join wait list
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
              Cancel
            </button>
          </div>
          <p className="text-xs text-slate-500">We&apos;ll email you when this breeder publishes a litter. You can ask to be removed anytime via help@breedwise.co.uk.</p>
        </form>
      )}
    </section>
  );
}
