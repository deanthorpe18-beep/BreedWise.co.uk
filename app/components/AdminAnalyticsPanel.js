"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Clock,
  Eye,
  Globe,
  Loader2,
  MousePointer,
  Search,
  Target,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronRight,
  Route,
  BarChart3,
} from "lucide-react";

function formatDuration(seconds) {
  if (!seconds || seconds < 1) return "< 1s";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ title, value, sub, icon: Icon, color = "text-[#00BFA5]" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        {Icon && (
          <div className={`rounded-xl bg-slate-50 p-2.5 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

function MiniBarChart({ data, valueKey, labelKey, color = "bg-[#00BFA5]" }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.slice(-14).map((d) => (
        <div key={d[labelKey]} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t ${color} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: `${Math.max(4, (d[valueKey] / max) * 100)}%`, minHeight: 4 }}
            title={`${d[labelKey]}: ${d[valueKey]}`}
          />
          <span className="text-[9px] text-slate-400 truncate w-full text-center">
            {d[labelKey]?.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

function JourneyRow({ journey, expanded, onToggle }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-500">#{journey.sessionId}</span>
            {journey.isOutreach && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                Outreach
              </span>
            )}
            <span className="text-xs text-slate-400">{formatDate(journey.startedAt)}</span>
          </div>
          <p className="mt-0.5 text-sm text-slate-700 truncate">
            {journey.entryPath || "/"} · {journey.pageCount} pages · {journey.clickCount} clicks
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-[#00BFA5]">{formatDuration(journey.durationSeconds)}</p>
          <p className="text-[10px] text-slate-400">on site</p>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 space-y-3">
          {journey.referrer && (
            <p className="text-xs text-slate-500">
              Referrer: <span className="text-slate-700">{journey.referrer}</span>
            </p>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Page journey</p>
            <div className="space-y-1.5">
              {journey.pages.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm rounded-xl bg-slate-50 px-3 py-2">
                  <span className="truncate text-slate-800 flex-1 mr-2">{p.path}</span>
                  <span className="text-xs font-medium text-slate-500 shrink-0">
                    {formatDuration(p.durationSeconds)}
                  </span>
                </div>
              ))}
              {journey.pages.length === 0 && (
                <p className="text-xs text-slate-400">No page data recorded yet.</p>
              )}
            </div>
          </div>
          {journey.clicks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Clicks</p>
              <div className="space-y-1">
                {journey.clicks.map((c, i) => (
                  <div key={i} className="text-xs text-slate-600 flex gap-2">
                    <MousePointer className="h-3 w-3 text-purple-400 shrink-0 mt-0.5" />
                    <span className="truncate">{c.text || c.href || c.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsPanel({ refreshTick = 0 }) {
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`);
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
  }, [load, refreshTick]);

  const organic = data?.organicReach;

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "organic", label: "Organic reach", icon: Route },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#00BFA5]" />
            Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Live traffic, visitor journeys, and engagement across BreedWise
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  tab === id ? "bg-[#00BFA5] text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50/50 px-4 py-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-sm font-medium text-green-800">
          {data?.onlineUsers ?? 0} users online now
        </span>
        <span className="text-xs text-green-600">· auto-refreshes every 30s</span>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
        </div>
      ) : !data ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          Unable to load analytics.
        </div>
      ) : tab === "overview" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Page views" value={data.totalPageViews?.toLocaleString()} icon={Eye} color="text-blue-500" />
            <StatCard title="CTA clicks" value={data.totalCtaClicks?.toLocaleString()} icon={MousePointer} color="text-purple-500" />
            <StatCard title="Searches" value={(data.totalSearches || 0).toLocaleString()} icon={Search} color="text-orange-500" />
            <StatCard
              title="Avg session"
              value={formatDuration(organic?.avgSessionDuration)}
              sub={`${organic?.totalSessions || 0} sessions`}
              icon={Clock}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Today", value: data.uniqueVisitors?.today },
              { label: "This week", value: data.uniqueVisitors?.week },
              { label: "This month", value: data.uniqueVisitors?.month },
              { label: "This year", value: data.uniqueVisitors?.year },
              { label: "All time", value: data.uniqueVisitors?.total },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-gradient-to-br from-[#00BFA5]/10 to-white border border-[#00BFA5]/20 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{value ?? 0}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-[#00BFA5]" />
                Daily page views
              </h3>
              <MiniBarChart data={data.dailyStats || []} valueKey="views" labelKey="date" />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-indigo-500" />
                Daily sessions
              </h3>
              <MiniBarChart
                data={organic?.dailySessions || []}
                valueKey="sessions"
                labelKey="date"
                color="bg-indigo-400"
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RankList title="Most viewed breeders" icon={Eye} items={data.topBreeders} nameKey="breeder_slug" countKey="views" />
            <RankList title="Top search terms" icon={Search} items={data.topSearchTerms} nameKey="name" countKey="count" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RankList title="Traffic sources" icon={Globe} items={data.topTrafficSources} nameKey="name" countKey="count" />
            <RankList title="UTM campaigns" icon={Target} items={data.topUtmCampaigns} nameKey="name" countKey="count" />
          </div>

          {Object.keys(data.ctaByType || {}).length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">CTA breakdown</h3>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {Object.entries(data.ctaByType).map(([type, count]) => (
                  <div key={type} className="rounded-2xl bg-purple-50 p-4 text-center">
                    <p className="text-2xl font-bold text-purple-900">{count}</p>
                    <p className="text-xs capitalize text-purple-600 mt-1">{type.replace("_", " ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              title="Organic sessions"
              value={organic?.organicSessions ?? 0}
              sub="Non-outreach traffic"
              icon={Globe}
              color="text-emerald-500"
            />
            <StatCard
              title="Outreach sessions"
              value={organic?.outreachSessions ?? 0}
              sub="From invitation links"
              icon={Target}
              color="text-orange-500"
            />
            <StatCard
              title="Avg time on site"
              value={formatDuration(organic?.avgSessionDuration)}
              sub="Per session"
              icon={Clock}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#00BFA5]" />
                Time spent by page
              </h3>
              {(organic?.topPagesByTime || []).length === 0 ? (
                <p className="text-sm text-slate-500">
                  Page duration tracking starts from now — data builds as visitors browse.
                </p>
              ) : (
                <div className="space-y-2">
                  {organic.topPagesByTime.map((p) => (
                    <div key={p.path} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{p.path}</p>
                        <p className="text-xs text-slate-400">{p.views} views · avg {formatDuration(p.avgSeconds)}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#00BFA5] shrink-0">
                        {formatDuration(p.totalSeconds)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-purple-500" />
                Most clicked elements
              </h3>
              {(organic?.topClicks || []).length === 0 ? (
                <p className="text-sm text-slate-500">Click tracking builds as visitors interact with the site.</p>
              ) : (
                <div className="space-y-2">
                  {organic.topClicks.map((c, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-sm text-slate-700 truncate flex-1 mr-2">{c.label}</span>
                      <span className="text-sm font-semibold text-purple-600">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Route className="h-4 w-4 text-indigo-500" />
              Visitor journeys
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Expand a session to see every page visited, time spent, and what they clicked.
            </p>
            {(organic?.journeys || []).length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">
                No session journeys yet. Visitors need analytics consent enabled.
              </p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {organic.journeys.map((j) => (
                  <JourneyRow
                    key={j.sessionId + j.startedAt}
                    journey={j}
                    expanded={expandedSession === j.sessionId + j.startedAt}
                    onToggle={() =>
                      setExpandedSession(
                        expandedSession === j.sessionId + j.startedAt
                          ? null
                          : j.sessionId + j.startedAt
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function RankList({ title, icon: Icon, items, nameKey, countKey }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-4 w-4 text-[#00BFA5]" />}
        {title}
      </h3>
      {(items || []).length === 0 ? (
        <p className="text-sm text-slate-500">No data yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item[nameKey]} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00BFA5] text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-slate-800 truncate">{item[nameKey]}</span>
              </div>
              <span className="text-sm font-semibold text-slate-600 shrink-0">{item[countKey]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
