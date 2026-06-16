import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getUserBreederId(adminClient, userId, userEmail) {
  const { data: subscription } = await adminClient
    .from("breeder_subscriptions")
    .select("breeder_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (subscription?.breeder_id) return subscription.breeder_id;

  const { data: claim } = await adminClient
    .from("claims")
    .select("breeder_slug")
    .eq("claimant_user_id", userId)
    .eq("status", "approved")
    .order("reviewed_at", { ascending: false })
    .maybeSingle();
  if (claim?.breeder_slug) {
    const { data: breeder } = await adminClient.from("breeders").select("id").eq("slug", claim.breeder_slug).maybeSingle();
    if (breeder?.id) return breeder.id;
  }

  if (userEmail) {
    const { data: breederByEmail } = await adminClient
      .from("breeders")
      .select("id")
      .eq("email", userEmail)
      .eq("status", "claimed_profile")
      .maybeSingle();
    if (breederByEmail?.id) return breederByEmail.id;
  }

  return null;
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const breederId = await getUserBreederId(adminClient, user.id, user.email);

    if (!breederId) {
      return NextResponse.json({ error: "No claimed breeder found" }, { status: 404 });
    }

    const { data: daily } = await adminClient
      .from("breeder_analytics_daily")
      .select("*")
      .eq("breeder_id", breederId)
      .gte("date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0])
      .order("date", { ascending: false });

    const summary = { page_views: 0, website_clicks: 0, phone_clicks: 0, favourites_count: 0, search_impressions: 0, message_count: 0 };
    for (const day of daily || []) {
      summary.page_views += day.page_views || 0;
      summary.website_clicks += day.website_clicks || 0;
      summary.phone_clicks += day.phone_clicks || 0;
      summary.favourites_count += day.favourites_count || 0;
      summary.search_impressions += day.search_impressions || 0;
      summary.message_count += day.message_count || 0;
    }

    return NextResponse.json({ summary, daily: daily || [] });
  } catch (err) {
    console.error("[breeder/analytics] Error:", err?.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
