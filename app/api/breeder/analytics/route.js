import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getUserBreeder(adminClient, userId, userEmail) {
  const { data: subscription } = await adminClient
    .from("breeder_subscriptions")
    .select("breeder_id, breeders(slug)")
    .eq("user_id", userId)
    .maybeSingle();
  if (subscription?.breeder_id) {
    return { id: subscription.breeder_id, slug: subscription.breeders?.slug };
  }

  const { data: claim } = await adminClient
    .from("claims")
    .select("breeder_slug")
    .eq("claimant_user_id", userId)
    .eq("status", "approved")
    .order("reviewed_at", { ascending: false })
    .maybeSingle();
  if (claim?.breeder_slug) {
    const { data: breeder } = await adminClient
      .from("breeders")
      .select("id, slug")
      .eq("slug", claim.breeder_slug)
      .maybeSingle();
    if (breeder) return breeder;
  }

  if (userEmail) {
    const { data: breederByEmail } = await adminClient
      .from("breeders")
      .select("id, slug")
      .eq("email", userEmail)
      .eq("status", "claimed_profile")
      .maybeSingle();
    if (breederByEmail) return breederByEmail;
  }

  return null;
}

function groupByDate(rows, dateField = "created_at") {
  const map = {};
  for (const row of rows || []) {
    const day = row[dateField]?.split("T")[0];
    if (!day) continue;
    map[day] = (map[day] || 0) + 1;
  }
  return map;
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const breeder = await getUserBreeder(adminClient, user.id, user.email);

    if (!breeder?.id || !breeder?.slug) {
      return NextResponse.json({ error: "No claimed breeder found" }, { status: 404 });
    }

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
        .eq("breeder_id", breeder.id),
      adminClient
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("breeder_user_id", user.id)
        .gte("created_at", since),
    ]);

    const viewsByDay = groupByDate(pageViews);
    const clicksByDay = groupByDate(ctaClicks);

    let website_clicks = 0;
    let phone_clicks = 0;
    let search_impressions = 0;
    for (const c of ctaClicks || []) {
      if (c.action_type === "website" || c.action_type === "email") website_clicks++;
      if (c.action_type === "call" || c.action_type === "phone") phone_clicks++;
      if (c.action_type === "search_impression") search_impressions++;
    }

    const allDays = new Set([...Object.keys(viewsByDay), ...Object.keys(clicksByDay)]);
    const daily = [...allDays]
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        page_views: viewsByDay[date] || 0,
        website_clicks: 0,
        phone_clicks: 0,
        favourites_count: 0,
        search_impressions: 0,
        message_count: 0,
      }));

    const summary = {
      page_views: pageViews?.length || 0,
      website_clicks,
      phone_clicks,
      favourites_count: favouritesCount || 0,
      search_impressions,
      message_count: messageCount || 0,
    };

    return NextResponse.json({ summary, daily, breederSlug: breeder.slug });
  } catch (err) {
    console.error("[breeder/analytics] Error:", err?.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
