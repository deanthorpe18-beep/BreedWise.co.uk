"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SearchIcon, UserCheck, CheckCircle, Mail, AlertCircle, Loader2 } from "lucide-react";
import PageViewTracker from "@components/PageViewTracker";

export default function ClaimPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [form, setForm] = useState({ breederSlug: "", breederName: "", email: "", name: "", notes: "" });
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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/claims", {
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
    <>
      <PageViewTracker page="claim" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">How to claim</p>
              <h1 className="text-4xl font-semibold text-slate-900">Claim your breeder profile</h1>
              <p className="text-lg leading-7 text-slate-600">
                If you are a breeder listed on BreedWise, you can claim your profile to update information and improve accuracy. Claims are reviewed manually before approval.
              </p>
            </div>
          </div>

          {!user && !loadingUser && (
            <div className="rounded-3xl border border-[#00BFA5] bg-[#E6FFFB] p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#00BFA5] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Authentication required</p>
                  <p className="mt-1 text-sm text-slate-600">
                    You must be logged in to submit a claim.{" "}
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
              <h2 className="mt-4 text-xl font-semibold text-slate-900">Claim submitted</h2>
              <p className="mt-2 text-slate-600">We have received your claim and will review it within 1–2 working days. You will receive an email confirmation shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
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
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:bg-slate-50 disabled:text-slate-400"
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
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:bg-slate-50 disabled:text-slate-400"
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
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:bg-slate-50 disabled:text-slate-400"
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
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  disabled={!user}
                  rows={4}
                  placeholder="Any additional information to help us verify your claim."
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={!user || loading}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e] disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit claim for review
              </button>
              <p className="text-xs text-slate-500">
                By submitting, you confirm you are the breeder or an authorised representative. Claims are reviewed manually before any changes go live.
              </p>
            </form>
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">How claiming works</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00BFA5] mb-3">
                  <SearchIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">1. Find your profile</h3>
                <p className="mt-1 text-sm text-slate-600">Search for your listing and copy the profile URL or slug.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00BFA5] mb-3">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">2. Submit your claim</h3>
                <p className="mt-1 text-sm text-slate-600">Log in and complete the claim form with your details.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00BFA5] mb-3">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">3. Wait for review</h3>
                <p className="mt-1 text-sm text-slate-600">We review claims within 1–2 working days and email you the outcome.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">What you can update after claiming</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Business details (phone, website, email)",
                "Kennel club information",
                "Health testing details",
                "Business description",
                "Council licence status",
                "Location notes",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#00BFA5]" />
                  <span className="text-slate-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-900">Not listed correctly?</p>
              <p className="text-sm text-slate-600">You can also request removal of your listing.</p>
            </div>
            <Link href="/request-removal" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Request removal
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
