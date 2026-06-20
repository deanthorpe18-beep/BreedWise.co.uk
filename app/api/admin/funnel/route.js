import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function pct(numerator, denominator, cap = 100) {
  if (!denominator || denominator <= 0) return null;
  const raw = (numerator / denominator) * 100;
  return Math.min(cap, raw).toFixed(1);
}

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const adminClient = createAdminClient();

    const [
      { count: searchesLogged },
      { count: searchPageViews },
      { count: profileViews },
      { count: searchProfileViews },
      { count: ctaClicks },
      { count: conversations },
      { count: claims },
    ] = await Promise.all([
      adminClient
        .from("search_analytics")
        .select("*", { count: "exact", head: true })
        .gte("searched_at", since),
      adminClient
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since)
        .ilike("page_path", "/search%"),
      adminClient
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since)
        .not("breeder_slug", "is", null),
      adminClient
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since)
        .not("breeder_slug", "is", null)
        .or("referrer.ilike.%/search%,referrer.ilike.%breedwise.co.uk/search%,referrer.ilike.%breedwise.co.uk%2Fsearch%"),
      adminClient
        .from("cta_clicks")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since)
        .in("action_type", ["phone", "email", "message", "website", "call"]),
      adminClient
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since),
      adminClient
        .from("claims")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since),
    ]);

    // Best available search volume (logged searches or search page visits)
    const searches = Math.max(searchesLogged || 0, searchPageViews || 0);

    const searchToProfile = pct(searchProfileViews || 0, searches);
    const profileToCta = pct(ctaClicks || 0, profileViews || 0);
    const ctaToConversation = pct(conversations || 0, ctaClicks || 0);

    const { data: dailyViews } = await adminClient
      .from("page_views")
      .select("created_at, breeder_slug, page_path, referrer")
      .gte("created_at", since);

    const { data: dailyCtas } = await adminClient
      .from("cta_clicks")
      .select("created_at")
      .gte("created_at", since);

    const { data: dailySearches } = await adminClient
      .from("search_analytics")
      .select("searched_at")
      .gte("searched_at", since);

    const daily = {};
    (dailySearches || []).forEach((s) => {
      const day = s.searched_at.split("T")[0];
      if (!daily[day]) daily[day] = { searchesLogged: 0, searchPageViews: 0, profileViews: 0, ctaClicks: 0 };
      daily[day].searchesLogged++;
    });
    (dailyViews || []).forEach((v) => {
      const day = v.created_at.split("T")[0];
      if (!daily[day]) daily[day] = { searchesLogged: 0, searchPageViews: 0, profileViews: 0, ctaClicks: 0 };
      if (v.page_path?.startsWith("/search")) daily[day].searchPageViews++;
      if (v.breeder_slug) daily[day].profileViews++;
    });
    (dailyCtas || []).forEach((c) => {
      const day = c.created_at.split("T")[0];
      if (!daily[day]) daily[day] = { searchesLogged: 0, searchPageViews: 0, profileViews: 0, ctaClicks: 0 };
      daily[day].ctaClicks++;
    });

    return NextResponse.json({
      funnel: {
        searches,
        searchesLogged: searchesLogged || 0,
        searchPageViews: searchPageViews || 0,
        profileViews: profileViews || 0,
        searchProfileViews: searchProfileViews || 0,
        ctaClicks: ctaClicks || 0,
        conversations: conversations || 0,
        claims: claims || 0,
        searchToProfile,
        profileToCta,
        ctaToConversation,
      },
      daily: Object.entries(daily)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, v]) => ({
          date,
          searches: Math.max(v.searchesLogged, v.searchPageViews),
          profileViews: v.profileViews,
          ctaClicks: v.ctaClicks,
        })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
