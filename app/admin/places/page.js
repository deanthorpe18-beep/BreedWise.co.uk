"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@components/AuthProvider";
import { Loader2, RefreshCw, Database, Clock, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminPlacesCachePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshAllLoading, setRefreshAllLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/places/cache-status");
    const data = await res.json();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const refreshPlace = async (placeId) => {
    setRefreshing(placeId);
    const res = await fetch("/api/admin/places/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId }),
    });
    const data = await res.json();
    setRefreshing(false);
    setMessage(data.message || "Refreshed.");
    await load();
  };

  const refreshAll = async () => {
    setRefreshAllLoading(true);
    const res = await fetch("/api/admin/places/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    const data = await res.json();
    setRefreshAllLoading(false);
    setMessage(`Refreshed ${data.refreshed || 0} places.`);
    await load();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Google Places Cache</h1>
          <p className="text-sm text-slate-500">Manage cached Google Places data to control API costs.</p>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl bg-[#E6FFFB] p-4 text-sm text-[#00BFA5]">
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <Database className="h-6 w-6 text-[#00BFA5]" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats?.totalCached || 0}</p>
          <p className="text-sm text-slate-500">Total cached</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <Clock className="h-6 w-6 text-amber-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats?.staleCount || 0}</p>
          <p className="text-sm text-slate-500">Stale entries</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <RefreshCw className="h-6 w-6 text-green-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats?.freshCount || 0}</p>
          <p className="text-sm text-slate-500">Fresh entries</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <AlertCircle className="h-6 w-6 text-purple-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats?.lastRefreshed?.length || 0}</p>
          <p className="text-sm text-slate-500">Recently refreshed</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8">
        <button
          onClick={refreshAll}
          disabled={refreshAllLoading}
          className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#00a98e] disabled:opacity-50"
        >
          {refreshAllLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh all stale
        </button>
      </div>

      {/* Cache list */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-[#F1F4F6] text-left">
              <th className="px-5 py-3 font-semibold text-slate-700">Place ID</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Cached</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Refreshes</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-5 py-3 font-semibold text-slate-700"></th>
            </tr>
          </thead>
          <tbody>
            {(stats?.lastRefreshed || []).map((item) => {
              const isStale = new Date(item.cached_at) < new Date(Date.now() - 7 * 86400000);
              return (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600 truncate max-w-[200px]">{item.place_id}</td>
                  <td className="px-5 py-3 text-slate-600">{new Date(item.cached_at).toLocaleDateString("en-GB")}</td>
                  <td className="px-5 py-3 text-slate-600">{item.refresh_count}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isStale ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    }`}>
                      {isStale ? "Stale" : "Fresh"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => refreshPlace(item.place_id)}
                      disabled={refreshing === item.place_id}
                      className="inline-flex items-center gap-1 rounded-full bg-[#F1F4F6] px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      {refreshing === item.place_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Refresh
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
