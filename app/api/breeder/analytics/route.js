import { NextResponse } from "next/server";
import { authenticateBreederAccess } from "@/lib/breeder-request-auth";
import {
  getAnalyticsAccessLevel,
  filterAnalyticsByAccess,
} from "@/lib/analytics-access";

export const dynamic = "force-dynamic";

function groupByDate(rows, dateField = "created_at") {
  const map = {};
  for (const row of rows || []) {
    const day = row[dateField]?.split("T")[0];
    if (!day) continue;
    map[day] = (map[day] || 0) + 1;
  }
  return map;
}

function groupCtaByDate(rows) {
  const map = {};
  for (const row of rows || []) {
    const day = row.created_at?.split("T")[0];
    if (!day) continue;
    if (!map[day]) map[day] = { website: 0, phone: 0 };
    if (row.action_type === "website" || row.action_type === "email") map[day].website++;
    if (row.action_type === "call" || row.action_type === "phone") map[day].phone++;
  }
  return map;
}

export async function GET(request) {
  try {
    const auth = await authenticateBreederAccess(request);
    if (auth.response) return auth.response;

    const { adminClient, user, breederId, breeder } = auth;

    if (!breeder?.slug) {
      return NextResponse.json({ error: "No claimed breeder found" }, { status: 404 });
    }

    const { data: breederRow } = await adminClient
      .from("breeders")
      .select("membership_tier")
      .eq("id", breederId)
      .maybeSingle();

    const tier = breederRow?.membership_tier || "free";
    const accessLevel = getAnalyticsAccessLevel(tier);

    const since = new Date(Date.now() - 30 * 86400000).toISOString();

    const [
      { data: pageViews },
      { data: ctaClicks },
      { count: favouritesCount },
      { count: messageCount },
    ] = await Promise.all([
      adminClient
        .from("page_views")
        .select("created_at")
        .eq("breeder_slug", breeder.slug)
        .gte("created_at", since),
      adminClient
        .from("cta_clicks")
        .select("created_at, action_type")
        .eq("breeder_slug", breeder.slug)
        .gte("created_at", since),
      adminClient
        .from("saved_breeders")
        .select("*", { count: "exact", head: true })
        .eq("breeder_id", breederId),
      adminClient
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("breeder_user_id", user.id)
        .gte("created_at", since),
    ]);

    const viewsByDay = groupByDate(pageViews);
    const ctaByDay = groupCtaByDate(ctaClicks);

    let website_clicks = 0;
    let phone_clicks = 0;
    let search_impressions = 0;
    let share_clicks = 0;
    for (const c of ctaClicks || []) {
      if (c.action_type === "website" || c.action_type === "email") website_clicks++;
      if (c.action_type === "call" || c.action_type === "phone") phone_clicks++;
      if (c.action_type === "search_impression") search_impressions++;
      if (c.action_type === "share") share_clicks++;
    }

    const allDays = new Set([...Object.keys(viewsByDay), ...Object.keys(ctaByDay)]);
    const daily = [...allDays]
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30)
      .map((date) => ({
        date,
        page_views: viewsByDay[date] || 0,
        website_clicks: ctaByDay[date]?.website || 0,
        phone_clicks: ctaByDay[date]?.phone || 0,
        favourites_count: 0,
        search_impressions: 0,
        message_count: 0,
      }));

    const payload = filterAnalyticsByAccess(accessLevel, {
      summary: {
        page_views: pageViews?.length || 0,
        website_clicks,
        phone_clicks,
        favourites_count: favouritesCount || 0,
        search_impressions,
        share_clicks,
        message_count: messageCount || 0,
      },
      daily,
      breederSlug: breeder.slug,
      accessLevel,
      tier,
    });

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[breeder/analytics] Error:", err?.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
