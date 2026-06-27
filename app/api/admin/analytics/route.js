import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";

async function countUniqueVisitors(adminClient, sinceDate) {
  // Fetch all ip_hash values since the given date and count distinct ones
  // Paginate in case of large datasets
  const allHashes = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await adminClient
      .from("page_views")
      .select("ip_hash")
      .gte("created_at", sinceDate)
      .range(from, from + batchSize - 1);

    if (error || !data || data.length === 0) break;
    allHashes.push(...data);
    if (data.length < batchSize) break;
    from += batchSize;
  }

  return new Set(allHashes.map((d) => d.ip_hash).filter(Boolean)).size;
}

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get("days") || "30", 10), 365);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const adminClient = createAdminClient();

    // Clean stale sessions first (older than 1 hour) — don't fail analytics if this errors
    try {
      await adminClient
        .from("user_sessions")
        .delete()
        .lt("last_active_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
    } catch (cleanupErr) {
      console.error("[analytics] Failed to clean stale sessions:", cleanupErr?.message || cleanupErr);
    }

    // ── Time boundaries for visitor counters ──
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
    const allTimeStart = "1970-01-01T00:00:00Z";

    // ── Online users (active in last 5 minutes) ──
    const { count: onlineUsers } = await adminClient
      .from("user_sessions")
      .select("*", { count: "exact", head: true })
      .gte("last_active_at", new Date(Date.now() - 5 * 60 * 1000).toISOString());

    // ── Unique visitors by period ──
    const [
      visitorsToday,
      visitorsWeek,
      visitorsMonth,
      visitorsYear,
      visitorsTotal,
    ] = await Promise.all([
      countUniqueVisitors(adminClient, todayStart),
      countUniqueVisitors(adminClient, weekStart),
      countUniqueVisitors(adminClient, monthStart),
      countUniqueVisitors(adminClient, yearStart),
      countUniqueVisitors(adminClient, allTimeStart),
    ]);

    // ── Total page views in period ──
    const { count: totalPageViews } = await adminClient
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since);

    // ── Most viewed breeders ──
    const { data: pvData } = await adminClient
      .from("page_views")
      .select("breeder_slug")
      .gte("created_at", since)
      .not("breeder_slug", "is", null);

    const counts = {};
    (pvData || []).forEach((v) => {
      counts[v.breeder_slug] = (counts[v.breeder_slug] || 0) + 1;
    });
    const topBreeders = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([slug, views]) => ({ breeder_slug: slug, views }));

    // ── Search analytics ──
    const { data: searchData } = await adminClient
      .from("search_analytics")
      .select("query, breed, location, searched_at")
      .gte("searched_at", since);

    const topSearchTerms = {};
    const topSearchedBreeds = {};
    const topSearchedLocations = {};
    (searchData || []).forEach((s) => {
      if (s.query) topSearchTerms[s.query] = (topSearchTerms[s.query] || 0) + 1;
      if (s.breed) topSearchedBreeds[s.breed] = (topSearchedBreeds[s.breed] || 0) + 1;
      if (s.location) topSearchedLocations[s.location] = (topSearchedLocations[s.location] || 0) + 1;
    });

    const formatTop = (obj) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

    // ── CTA clicks by type ──
    const { data: ctaData } = await adminClient
      .from("cta_clicks")
      .select("action_type, breeder_slug")
      .gte("created_at", since);

    const ctaByType = {};
    const ctaByBreeder = {};
    (ctaData || []).forEach((c) => {
      ctaByType[c.action_type] = (ctaByType[c.action_type] || 0) + 1;
      if (!ctaByBreeder[c.breeder_slug]) ctaByBreeder[c.breeder_slug] = {};
      ctaByBreeder[c.breeder_slug][c.action_type] = (ctaByBreeder[c.breeder_slug][c.action_type] || 0) + 1;
    });

    const topCtaBreeders = Object.entries(ctaByBreeder)
      .map(([slug, actions]) => ({
        breeder_slug: slug,
        total: Object.values(actions).reduce((a, b) => a + b, 0),
        actions,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // ── Daily stats for chart ──
    const { data: dailyViews } = await adminClient
      .from("page_views")
      .select("created_at")
      .gte("created_at", since);

    const dailyStats = {};
    (dailyViews || []).forEach((v) => {
      const day = v.created_at.split("T")[0];
      dailyStats[day] = (dailyStats[day] || 0) + 1;
    });

    // ── Traffic sources (referrer domains) ──
    const { data: referrerData } = await adminClient
      .from("page_views")
      .select("referrer")
      .gte("created_at", since)
      .not("referrer", "is", null);

    const trafficSources = {};
    (referrerData || []).forEach((r) => {
      const ref = r.referrer || "";
      let domain = "Direct / None";
      if (ref) {
        try {
          domain = new URL(ref).hostname.replace(/^www\./, "");
        } catch {
          domain = ref.length > 40 ? ref.slice(0, 40) + "..." : ref;
        }
      }
      trafficSources[domain] = (trafficSources[domain] || 0) + 1;
    });

    const topTrafficSources = Object.entries(trafficSources)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // ── UTM campaign tracking ──
    const { data: utmData } = await adminClient
      .from("page_views")
      .select("page_path")
      .gte("created_at", since);

    const utmCampaigns = {};
    (utmData || []).forEach((v) => {
      const path = v.page_path || "";
      const utmMatch = path.match(/[?&]utm_campaign=([^&]+)/);
      if (utmMatch) {
        const campaign = decodeURIComponent(utmMatch[1]);
        utmCampaigns[campaign] = (utmCampaigns[campaign] || 0) + 1;
      }
    });

    const topUtmCampaigns = Object.entries(utmCampaigns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // ── Visitor journeys (organic reach) ──
    const { data: visitorSessions } = await adminClient
      .from("visitor_sessions")
      .select("*")
      .gte("started_at", since)
      .order("started_at", { ascending: false })
      .limit(200);

    const sessionIds = (visitorSessions || []).map((s) => s.session_id);
    let pageViewsBySession = {};
    let eventsBySession = {};

    if (sessionIds.length > 0) {
      const { data: sessionPages } = await adminClient
        .from("page_views")
        .select("session_id, page_path, duration_seconds, created_at, breeder_slug")
        .in("session_id", sessionIds)
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      (sessionPages || []).forEach((pv) => {
        if (!pageViewsBySession[pv.session_id]) pageViewsBySession[pv.session_id] = [];
        pageViewsBySession[pv.session_id].push(pv);
      });

      const { data: sessionEvents } = await adminClient
        .from("visitor_events")
        .select("session_id, event_type, page_path, element_text, element_href, created_at")
        .in("session_id", sessionIds)
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      (sessionEvents || []).forEach((ev) => {
        if (!eventsBySession[ev.session_id]) eventsBySession[ev.session_id] = [];
        eventsBySession[ev.session_id].push(ev);
      });
    }

    const journeys = (visitorSessions || []).slice(0, 50).map((s) => ({
      sessionId: s.session_id.slice(0, 8),
      startedAt: s.started_at,
      durationSeconds: s.total_duration_seconds || 0,
      pageCount: s.page_count || 0,
      clickCount: s.click_count || 0,
      entryPath: s.entry_path,
      referrer: s.referrer,
      utmSource: s.utm_source,
      utmCampaign: s.utm_campaign,
      isOutreach: s.utm_source === "outreach" || (s.entry_path || "").includes("source=outreach"),
      pages: (pageViewsBySession[s.session_id] || []).map((p) => ({
        path: p.page_path,
        durationSeconds: p.duration_seconds || 0,
        at: p.created_at,
        breederSlug: p.breeder_slug,
      })),
      clicks: (eventsBySession[s.session_id] || []).slice(0, 20).map((e) => ({
        type: e.event_type,
        text: e.element_text,
        href: e.element_href,
        page: e.page_path,
        at: e.created_at,
      })),
    }));

    const totalSessionDuration = (visitorSessions || []).reduce(
      (sum, s) => sum + (s.total_duration_seconds || 0),
      0
    );
    const avgSessionDuration =
      visitorSessions?.length > 0 ? Math.round(totalSessionDuration / visitorSessions.length) : 0;

    const pageTimeMap = {};
    Object.values(pageViewsBySession)
      .flat()
      .forEach((pv) => {
        const path = (pv.page_path || "/").split("?")[0];
        if (!pageTimeMap[path]) pageTimeMap[path] = { totalSeconds: 0, views: 0 };
        pageTimeMap[path].totalSeconds += pv.duration_seconds || 0;
        pageTimeMap[path].views += 1;
      });

    const topPagesByTime = Object.entries(pageTimeMap)
      .map(([path, stats]) => ({
        path,
        totalSeconds: stats.totalSeconds,
        avgSeconds: stats.views ? Math.round(stats.totalSeconds / stats.views) : 0,
        views: stats.views,
      }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds)
      .slice(0, 15);

    const clickMap = {};
    Object.values(eventsBySession)
      .flat()
      .forEach((ev) => {
        const key = ev.element_href || ev.element_text || "unknown";
        clickMap[key] = (clickMap[key] || 0) + 1;
      });

    const topClicks = Object.entries(clickMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([label, count]) => ({ label: label.slice(0, 80), count }));

    const organicSessions = (visitorSessions || []).filter(
      (s) => s.utm_source !== "outreach" && !(s.entry_path || "").includes("source=outreach")
    ).length;
    const outreachSessions = (visitorSessions || []).length - organicSessions;

    const dailySessions = {};
    (visitorSessions || []).forEach((s) => {
      const day = s.started_at.split("T")[0];
      dailySessions[day] = (dailySessions[day] || 0) + 1;
    });

    return NextResponse.json({
      onlineUsers: onlineUsers || 0,
      uniqueVisitors: {
        today: visitorsToday,
        week: visitorsWeek,
        month: visitorsMonth,
        year: visitorsYear,
        total: visitorsTotal,
      },
      totalPageViews: totalPageViews || 0,
      totalCtaClicks: (ctaData || []).length,
      topBreeders: topBreeders,
      topCtaBreeders: topCtaBreeders,
      ctaByType,
      dailyStats: Object.entries(dailyStats)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, views]) => ({ date, views })),
      topSearchTerms: formatTop(topSearchTerms),
      topSearchedBreeds: formatTop(topSearchedBreeds),
      topSearchedLocations: formatTop(topSearchedLocations),
      totalSearches: (searchData || []).length,
      topTrafficSources,
      topUtmCampaigns,
      organicReach: {
        totalSessions: visitorSessions?.length || 0,
        organicSessions,
        outreachSessions,
        avgSessionDuration,
        topPagesByTime,
        topClicks,
        dailySessions: Object.entries(dailySessions)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, sessions]) => ({ date, sessions })),
        journeys,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unable to fetch analytics." }, { status: 500 });
  }
}
