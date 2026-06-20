import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const adminClient = createAdminClient();

    const { count: searches } = await adminClient
      .from("search_analytics")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since);

    const { count: profileViews } = await adminClient
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since)
      .not("breeder_slug", "is", null);

    const { count: ctaClicks } = await adminClient
      .from("cta_clicks")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since)
      .in("action_type", ["phone", "email", "message", "website"]);

    const { count: conversations } = await adminClient
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since);

    const { count: claims } = await adminClient
      .from("claims")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since);

    const searchToProfile = searches ? ((profileViews / searches) * 100).toFixed(1) : 0;
    const profileToCta = profileViews ? ((ctaClicks / profileViews) * 100).toFixed(1) : 0;
    const ctaToConversation = ctaClicks ? ((conversations / ctaClicks) * 100).toFixed(1) : 0;

    const { data: dailyViews } = await adminClient
      .from("page_views")
      .select("created_at, breeder_slug")
      .gte("created_at", since);

    const { data: dailyCtas } = await adminClient
      .from("cta_clicks")
      .select("created_at")
      .gte("created_at", since);

    const { data: dailySearches } = await adminClient
      .from("search_analytics")
      .select("created_at")
      .gte("created_at", since);

    const daily = {};
    (dailySearches || []).forEach((s) => {
      const day = s.created_at.split("T")[0];
      if (!daily[day]) daily[day] = { searches: 0, profileViews: 0, ctaClicks: 0 };
      daily[day].searches++;
    });
    (dailyViews || []).forEach((v) => {
      const day = v.created_at.split("T")[0];
      if (!daily[day]) daily[day] = { searches: 0, profileViews: 0, ctaClicks: 0 };
      if (v.breeder_slug) daily[day].profileViews++;
    });
    (dailyCtas || []).forEach((c) => {
      const day = c.created_at.split("T")[0];
      if (!daily[day]) daily[day] = { searches: 0, profileViews: 0, ctaClicks: 0 };
      daily[day].ctaClicks++;
    });

    return NextResponse.json({
      funnel: {
        searches: searches || 0,
        profileViews: profileViews || 0,
        ctaClicks: ctaClicks || 0,
        conversations: conversations || 0,
        claims: claims || 0,
        searchToProfile,
        profileToCta,
        ctaToConversation,
      },
      daily: Object.entries(daily)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, v]) => ({ date, ...v })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
