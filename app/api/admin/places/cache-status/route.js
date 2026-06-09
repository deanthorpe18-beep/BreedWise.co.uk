import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createAdminClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Total cached entries
    const { count: totalCached, error: totalError } = await supabase
      .from("google_places_cache")
      .select("*", { count: "exact", head: true });

    if (totalError) throw totalError;

    // Stale entries (cached > 7 days ago)
    const { count: staleCount, error: staleError } = await supabase
      .from("google_places_cache")
      .select("*", { count: "exact", head: true })
      .lt("cached_at", sevenDaysAgo);

    if (staleError) throw staleError;

    // Recent refresh history
    const { data: lastRefreshed, error: refreshError } = await supabase
      .from("google_places_cache")
      .select("place_id, cached_at, refreshed_at, admin_refreshed_at, refresh_count")
      .order("refreshed_at", { ascending: false })
      .limit(50);

    if (refreshError) throw refreshError;

    // Latest admin refresh
    const { data: latestAdminRefresh, error: adminRefreshError } = await supabase
      .from("google_places_cache")
      .select("admin_refreshed_at, admin_refreshed_by")
      .order("admin_refreshed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (adminRefreshError) throw adminRefreshError;

    return NextResponse.json({
      totalCached: totalCached || 0,
      staleCount: staleCount || 0,
      freshCount: (totalCached || 0) - (staleCount || 0),
      lastRefreshed: lastRefreshed || [],
      latestAdminRefresh: latestAdminRefresh || null,
    });
  } catch (error) {
    console.error("Cache status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
