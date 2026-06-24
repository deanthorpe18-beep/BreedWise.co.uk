"use client";

import { useEffect, useState } from "react";
import { Mail, RefreshCw, Clock, CheckCircle } from "lucide-react";

export default function AdminOutreachPanel() {
  const [breeders, setBreeders] = useState([]);
  const [total, setTotal] = useState(0);
  const [showing, setShowing] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [weekStats, setWeekStats] = useState(null);

  const [selected, setSelected] = useState(new Set());

  const load = async () => {
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/admin/outreach");
      const data = await res.json();
      if (res.ok) {
        setBreeders(data.breeders || []);
        setTotal(data.total ?? (data.breeders || []).length);
        setShowing(data.showing ?? (data.breeders || []).length);
        setWeekStats(data.weekStats || null);
      } else {
        setError(data.error || "Failed to load breeders.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
        await load();
      } else {
        setError(data.error || "Failed to send emails.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Mail className="h-5 w-5 text-[#00BFA5]" />
          Outreach — Claim Invitations
        </h2>
        <button onClick={load} disabled={loading} className="inline-flex items-center gap-1.5 rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

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

      <p className="text-sm text-slate-600">
        Unclaimed breeders with a verified email address. Junk addresses (image filenames, platform placeholders) are filtered out automatically.
        {total > 0 && (
          <span className="ml-1 font-semibold text-slate-800">
            {total} ready for outreach
            {showing > 0 && showing < total ? ` (showing first ${showing})` : ""}.
          </span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={send} disabled={loading || selected.size === 0} className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50">
          <Mail className="h-4 w-4" />
          {loading ? "Sending…" : `Send invitation (${selected.size})`}
        </button>
        <button onClick={() => setSelected(new Set(breeders.filter((b) => !b.onCooldown).map((b) => b.slug)))} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Select all eligible</button>
        <button onClick={() => setSelected(new Set())} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Clear</button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
        {loading && breeders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-[#00BFA5]" />
            Loading unclaimed breeders…
          </div>
        ) : breeders.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No unclaimed breeders with contact info found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 w-10"></th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Name</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Email</th>
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
                      {b.website ? (
                        <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-[#00BFA5] hover:underline">
                          {b.website}
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
    </div>
  );
}
