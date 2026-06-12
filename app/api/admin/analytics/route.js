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
    const days = parseInt(searchParams.get("days") || "30", 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const adminClient = createAdminClient();

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
      .select("query, breed, location, created_at")
      .gte("created_at", since);

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
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unable to fetch analytics." }, { status: 500 });
  }
}
