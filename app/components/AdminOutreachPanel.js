"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Mail,
  RefreshCw,
  Clock,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminOutreachAnalytics from "@components/AdminOutreachAnalytics";

const PAGE_SIZE = 100;

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("…");
    out.push(sorted[i]);
  }
  return out;
}

export default function AdminOutreachPanel() {
  const [view, setView] = useState("send");
  const [breeders, setBreeders] = useState([]);
  const [total, setTotal] = useState(0);
  const [showing, setShowing] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [weekStats, setWeekStats] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const load = useCallback(async (opts = {}) => {
    const nextPage = opts.page ?? page;
    const nextSearch = opts.search ?? search;
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(PAGE_SIZE),
      });
      if (nextSearch) params.set("q", nextSearch);
      const res = await fetch(`/api/admin/outreach?${params}`);
      const data = await res.json();
      if (res.ok) {
        setBreeders(data.breeders || []);
        setTotal(data.total ?? 0);
        setShowing(data.showing ?? (data.breeders || []).length);
        setPage(data.page ?? nextPage);
        setTotalPages(data.totalPages ?? 1);
        setSearch(data.search ?? nextSearch);
        setWeekStats(data.weekStats || null);
      } else {
        setError(data.error || "Failed to load breeders.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setPage(1);
        setSelected(new Set());
        load({ page: 1, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search, load]);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    setSelected(new Set());
    setPage(p);
    load({ page: p, search });
  };

  const send = async () => {
    setMsg("");
    setError("");
    const slugs = Array.from(selected);
    if (slugs.length === 0) {
      setError("Select at least one breeder.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breederSlugs: slugs }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Sent ${data.sent} emails. ${data.failed} skipped/failed.`);
        setSelected(new Set());
        await load({ page, search });
      } else {
        setError(data.error || "Failed to send emails.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Mail className="h-5 w-5 text-[#00BFA5]" />
          Outreach — Claim Invitations
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setView("send")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                view === "send" ? "bg-[#00BFA5] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Send emails
            </button>
            <button
              type="button"
              onClick={() => setView("performance")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                view === "performance" ? "bg-[#00BFA5] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Performance
            </button>
          </div>
          {view === "send" && (
            <button
              onClick={() => load({ page, search })}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {view === "performance" ? (
        <AdminOutreachAnalytics />
      ) : (
        <>

      {msg && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {weekStats && weekStats.sent > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Last 7 days — outreach follow-up</p>
          <p className="mt-1">
            <strong>{weekStats.sent}</strong> emails sent ·{" "}
            <strong className="text-green-700">{weekStats.converted}</strong> signed up ·{" "}
            <strong className="text-amber-700">{weekStats.awaiting}</strong> still waiting
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Full cross-check is included in your weekly admin email every Monday.
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Search breeders</label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, email, town, or slug…"
            className="w-full rounded-2xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#00BFA5] focus:outline-none"
          />
        </div>
        {search && (
          <p className="mt-2 text-xs text-slate-500">
            Showing results for &ldquo;{search}&rdquo; — {total} match{total !== 1 ? "es" : ""}.
            <button type="button" onClick={() => setSearchInput("")} className="ml-2 font-semibold text-[#00BFA5] hover:underline">
              Clear search
            </button>
          </p>
        )}
      </div>

      <p className="text-sm text-slate-600">
        Unclaimed breeders with a verified email address. Junk addresses are filtered out automatically.
        {total > 0 && (
          <span className="ml-1 font-semibold text-slate-800">
            {total} ready for outreach · showing {rangeStart}–{rangeEnd} (page {page} of {totalPages}, {PAGE_SIZE} per page).
          </span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={send}
          disabled={loading || selected.size === 0}
          className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50"
        >
          <Mail className="h-4 w-4" />
          {loading ? "Sending…" : `Send invitation (${selected.size})`}
        </button>
        <button
          onClick={() => setSelected(new Set(breeders.filter((b) => !b.onCooldown).map((b) => b.slug)))}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Select all on this page
        </button>
        <button
          onClick={() => setSelected(new Set())}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
        {loading && breeders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-[#00BFA5]" />
            Loading unclaimed breeders…
          </div>
        ) : breeders.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            {search ? `No breeders match "${search}".` : "No unclaimed breeders with contact info found."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 w-10"></th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Name</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Email</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Location</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Website</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breeders.map((b) => {
                const cooldownUntil = b.lastSentAt
                  ? new Date(new Date(b.lastSentAt).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB")
                  : null;
                return (
                  <tr key={b.slug} className={`${selected.has(b.slug) ? "bg-[#00BFA5]/5" : ""} ${b.onCooldown ? "opacity-60" : ""}`}>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(b.slug)}
                        disabled={b.onCooldown}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(b.slug);
                          else next.delete(b.slug);
                          setSelected(next);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-[#00BFA5] focus:ring-[#00BFA5] disabled:opacity-30"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium text-slate-900">{b.name}</td>
                    <td className="px-4 py-2 text-slate-600">{b.email || "—"}</td>
                    <td className="px-4 py-2 text-slate-600">
                      {[b.town, b.county].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {b.website ? (
                        <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-[#00BFA5] hover:underline truncate block max-w-[180px]">
                          {b.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {b.outreachConverted ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                          <CheckCircle className="h-3 w-3" />
                          Signed up {b.convertedAt ? new Date(b.convertedAt).toLocaleDateString("en-GB") : ""}
                        </span>
                      ) : b.onCooldown ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          <Clock className="h-3 w-3" />
                          On cooldown until {cooldownUntil}
                        </span>
                      ) : b.lastSentAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          Last sent {new Date(b.lastSentAt).toLocaleDateString("en-GB")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Ready
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-600">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            {pageNumbers(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="px-2 text-xs text-slate-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  disabled={loading}
                  className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full px-2 text-xs font-semibold transition ${
                    p === page
                      ? "bg-[#00BFA5] text-white"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
