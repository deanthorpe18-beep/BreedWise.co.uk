"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Mail,
  Eye,
  MousePointer,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  XCircle,
} from "lucide-react";

function FunnelBar({ label, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {count} <span className="text-slate-400">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SegmentTable({ title, icon: Icon, color, rows, emptyMsg }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className={`px-4 py-3 border-b border-slate-100 flex items-center gap-2 ${color}`}>
        {Icon && <Icon className="h-4 w-4" />}
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="ml-auto text-xs font-bold opacity-70">{rows.length}</span>
      </div>
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-slate-500">{emptyMsg}</p>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Breeder</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Email</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 font-medium text-slate-800">{r.breeder_name}</td>
                  <td className="px-3 py-2 text-slate-600">{r.to_email}</td>
                  <td className="px-3 py-2 text-xs text-slate-400">
                    {new Date(r.sent_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminOutreachAnalytics() {
  const [days, setDays] = useState(90);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/outreach/analytics?days=${days}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Unable to load outreach performance.</p>;
  }

  const { summary, rates, segments, funnel } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#00BFA5]" />
            Email performance
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Opens and clicks require Resend webhooks — configure in Resend dashboard → Webhooks →{" "}
            <code className="text-[10px] bg-slate-100 px-1 rounded">/api/webhooks/resend</code>
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Sent", value: summary.sent, icon: Mail, color: "text-slate-600" },
          { label: "Opened", value: `${summary.opened} (${rates.openRate}%)`, icon: Eye, color: "text-blue-600" },
          { label: "Clicked", value: `${summary.clicked} (${rates.clickRate}%)`, icon: MousePointer, color: "text-purple-600" },
          { label: "Signed up", value: `${summary.signedUp} (${rates.signupRate}%)`, icon: UserPlus, color: "text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs font-medium text-slate-500">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900">Conversion funnel</h3>
        {funnel.map((step) => (
          <FunnelBar
            key={step.label}
            label={step.label}
            count={step.count}
            total={summary.sent}
            color={
              step.label === "Claimed listing"
                ? "bg-green-500"
                : step.label === "Signed up"
                  ? "bg-emerald-400"
                  : "bg-[#00BFA5]"
            }
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SegmentTable
          title="Not opened"
          icon={XCircle}
          color="text-red-700 bg-red-50"
          rows={segments.notOpened}
          emptyMsg="Everyone has opened their email — or no sends yet."
        />
        <SegmentTable
          title="Opened but didn't click"
          icon={Eye}
          color="text-amber-700 bg-amber-50"
          rows={segments.openedNoClick}
          emptyMsg="No one in this segment."
        />
        <SegmentTable
          title="Clicked / visited but no signup"
          icon={MousePointer}
          color="text-orange-700 bg-orange-50"
          rows={segments.clickedNoSignup}
          emptyMsg="No one in this segment."
        />
        <SegmentTable
          title="Signed up but not claimed"
          icon={AlertCircle}
          color="text-purple-700 bg-purple-50"
          rows={segments.signedUpNoClaim}
          emptyMsg="All signups have claimed — or none yet."
        />
      </div>

      {segments.completed.length > 0 && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {segments.completed.length} fully converted (signed up + claimed listing)
          </p>
        </div>
      )}
    </div>
  );
}
