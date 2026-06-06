"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function RequestRemovalPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [form, setForm] = useState({ breederSlug: "", breederName: "", email: "", name: "", reason: "", gdprRequest: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        if (data.user?.email) {
          setForm((prev) => ({ ...prev, email: data.user.email, name: data.user.displayName || "" }));
        }
        setLoadingUser(false);
      })
      .catch(() => setLoadingUser(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/removals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <Trash2 className="h-5 w-5 text-[#FF6B6B]" />
            <p className="text-sm uppercase tracking-[0.3em] text-[#FF6B6B]">Request removal</p>
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Request listing removal</h1>
          <p className="mt-2 text-sm text-slate-600">
            If you are a breeder and do not wish to appear in the BreedWise directory, you can request removal here. All requests are reviewed manually before any action is taken.
          </p>
        </div>

        {!user && !loadingUser && (
          <div className="rounded-3xl border border-[#FF6B6B]/30 bg-[#FFE9E9] p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Authentication required</p>
                <p className="mt-1 text-sm text-slate-600">
                  You must be logged in to submit a removal request.{" "}
                  <Link href="/auth/login" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">Log in</Link>{" "}
                  or{" "}
                  <Link href="/auth/signup" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">create an account</Link>.
                </p>
              </div>
            </div>
          </div>
        )}

        {submitted ? (
          <div className="rounded-3xl border border-[#00BFA5] bg-[#E6FFFB] p-8 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-[#00BFA5]" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900">Request received</h2>
            <p className="mt-2 text-slate-600">
              We have received your removal request and will review it within 1–2 working days. You will receive an email confirmation shortly.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Please note that we may retain anonymised or aggregated data as outlined in our Privacy Policy.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {error && (
              <div className="flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700">Breeder slug or profile URL</label>
              <input
                name="breederSlug"
                value={form.breederSlug}
                onChange={handleChange}
                required
                disabled={!user}
                placeholder="e.g. chichester-labrador-kennels-chichester"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Breeder name</label>
              <input
                name="breederName"
                value={form.breederName}
                onChange={handleChange}
                disabled={!user}
                placeholder="Your breeder or kennel name"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Your name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  disabled={!user}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Your email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={!user}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Reason for removal</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                required
                disabled={!user}
                rows={6}
                placeholder="Explain why this listing should be removed. For example: I am the breeder and I do not wish to be listed."
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="gdprRequest"
                checked={form.gdprRequest}
                onChange={handleChange}
                disabled={!user}
                className="mt-1 accent-[#00BFA5]"
              />
              <span className="text-sm text-slate-600">
                I am requesting this removal under UK GDPR Article 17 (right to erasure).
              </span>
            </label>

            <button
              type="submit"
              disabled={!user || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#FF6B6B] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#FF6B6B]/20 transition hover:bg-[#e65a5a] disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send removal request
            </button>

            <p className="text-xs text-slate-500">
              Submission does not guarantee immediate removal. Requests are reviewed manually, typically within 1–2 working days.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
