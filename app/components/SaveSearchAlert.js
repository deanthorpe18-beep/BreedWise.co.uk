"use client";

import { useState } from "react";
import { Bell, Loader2, CheckCircle } from "lucide-react";

export default function SaveSearchAlert({ query, breed, animal, hasResults }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!query && !breed && !animal) return null;

  const save = async () => {
    setLoading(true);
    setError("");
    const name = [breed, animal, query].filter(Boolean).join(" · ") || "My search";
    try {
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.slice(0, 80),
          query: query || null,
          breed: breed || null,
          animal: animal || null,
          notify_new: true,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setDone(true);
      setOpen(false);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
        <CheckCircle className="h-4 w-4 shrink-0" />
        Alert saved — we&apos;ll email you when new breeders match this search.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#00BFA5]/20 bg-gradient-to-r from-[#E6FFFB]/60 to-white px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00BFA5]/10">
            <Bell className="h-5 w-5 text-[#00BFA5]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {hasResults ? "Get notified about new listings" : "No matches yet — get alerted"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              We&apos;ll email you when new breeders match{breed ? ` ${breed}` : ""}{query ? ` near ${query}` : ""}.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00BFA5] px-4 py-2 text-sm font-bold text-white hover:bg-[#00a98e] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          Create alert
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
