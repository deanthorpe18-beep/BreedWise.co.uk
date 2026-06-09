import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the breeder profile claimed by this user
  const { data: claim } = await supabase
    .from("claims")
    .select("breeder_slug")
    .eq("claimant_user_id", user.id)
    .eq("status", "approved")
    .single();

  if (!claim) {
    return NextResponse.json({ error: "No claimed breeder found" }, { status: 404 });
  }

  const { data: breeder } = await supabase
    .from("breeders")
    .select("id")
    .eq("slug", claim.breeder_slug)
    .single();

  if (!breeder) {
    return NextResponse.json({ error: "Breeder not found" }, { status: 404 });
  }

  const breederId = breeder.id;

  // Get last 30 days of analytics
  const { data: daily } = await supabase
    .from("breeder_analytics_daily")
    .select("*")
    .eq("breeder_id", breederId)
    .gte("date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0])
    .order("date", { ascending: false });

  // Aggregate summary
  const summary = {
    page_views: 0,
    website_clicks: 0,
    phone_clicks: 0,
    favourites_count: 0,
    search_impressions: 0,
    message_count: 0,
  };

  for (const day of daily || []) {
    summary.page_views += day.page_views || 0;
    summary.website_clicks += day.website_clicks || 0;
    summary.phone_clicks += day.phone_clicks || 0;
    summary.favourites_count += day.favourites_count || 0;
    summary.search_impressions += day.search_impressions || 0;
    summary.message_count += day.message_count || 0;
  }

  return NextResponse.json({ summary, daily: daily || [] });
}
