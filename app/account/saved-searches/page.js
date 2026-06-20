"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, BellOff, Loader2, Trash2, Search } from "lucide-react";

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/saved-searches")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/auth/login?redirect=/account/saved-searches";
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setSearches(data.saved_searches || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleNotify = async (id, current) => {
    const res = await fetch("/api/saved-searches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, notify_new: !current }),
    });
    if (res.ok) load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this saved search?")) return;
    await fetch("/api/saved-searches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const searchUrl = (s) => {
    const params = new URLSearchParams();
    if (s.query) params.set("q", s.query);
    if (s.breed) params.set("breed", s.breed);
    if (s.animal) params.set("animal", s.animal);
    return `/search?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Search alerts</h1>
      <p className="mt-2 text-sm text-slate-600">
        Get emailed when new breeders match your saved searches.
      </p>

      {searches.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Bell className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-semibold text-slate-900">No alerts yet</p>
          <p className="mt-2 text-sm text-slate-500">Search for breeders and click &quot;Create alert&quot; to get notified.</p>
          <Link href="/search" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#00a98e]">
            <Search className="h-4 w-4" /> Start searching
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {searches.map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={searchUrl(s)} className="font-semibold text-slate-900 hover:text-[#00BFA5]">
                    {s.name}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {[s.breed, s.animal, s.query].filter(Boolean).join(" · ") || "All breeders"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleNotify(s.id, s.notify_new)}
                    className={`rounded-xl p-2 transition ${s.notify_new ? "bg-[#E6FFFB] text-[#00BFA5]" : "bg-slate-100 text-slate-400"}`}
                    title={s.notify_new ? "Alerts on" : "Alerts off"}
                  >
                    {s.notify_new ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => remove(s.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
