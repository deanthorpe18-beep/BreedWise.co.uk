import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const adminClient = createAdminClient();

    // Fetch current featured breeders with rotation stats
    const now = new Date().toISOString();
    const { data: breeders, error, count } = await adminClient
      .from("breeders")
      .select("id, slug, name, town, county, membership_tier, is_featured, featured_until, featured_priority, claimed, claimed_at", { count: "exact" })
      .eq("is_featured", true)
      .gt("featured_until", now)
      .order("featured_priority", { ascending: false })
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const breederIds = (breeders || []).map((b) => b.id);

    // Get rotation stats
    let rotationStats = [];
    if (breederIds.length > 0) {
      const { data: logs } = await adminClient
        .from("featured_rotation_log")
        .select("breeder_id, shown_at")
        .in("breeder_id", breederIds)
        .order("shown_at", { ascending: false });

      // Aggregate per breeder
      const statsMap = new Map();
      for (const log of logs || []) {
        if (!statsMap.has(log.breeder_id)) {
          statsMap.set(log.breeder_id, {
            lastShown: log.shown_at,
            showCount: 0,
          });
        }
        statsMap.get(log.breeder_id).showCount += 1;
      }

      rotationStats = breederIds.map((id) => ({
        breeder_id: id,
        last_shown: statsMap.get(id)?.lastShown || null,
        show_count: statsMap.get(id)?.showCount || 0,
      }));
    }

    return NextResponse.json({
      breeders: breeders || [],
      rotation_stats: rotationStats,
      total: count || 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("Admin featured breeders GET error:", err);
    return NextResponse.json({ error: err.message || "Unable to fetch featured breeders." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { breederId, action, priority } = body;

    if (!breederId || !action) {
      return NextResponse.json({ error: "breederId and action are required." }, { status: 400 });
    }

    if (!["feature", "unfeature"].includes(action)) {
      return NextResponse.json({ error: "action must be 'feature' or 'unfeature'." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    if (action === "feature") {
      // Set featured status and priority
      const { data: breeder, error } = await adminClient
        .from("breeders")
        .update({
          is_featured: true,
          featured_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
          featured_priority: typeof priority === "number" ? priority : 0,
          last_updated_at: new Date().toISOString(),
        })
        .eq("id", breederId)
        .select("id, slug, name, is_featured, featured_until, featured_priority")
        .single();

      if (error) throw error;

      return NextResponse.json({ breeder, message: "Breeder featured successfully." });
    }

    if (action === "unfeature") {
      const { data: breeder, error } = await adminClient
        .from("breeders")
        .update({
          is_featured: false,
          featured_until: null,
          featured_priority: 0,
          last_updated_at: new Date().toISOString(),
        })
        .eq("id", breederId)
        .select("id, slug, name, is_featured, featured_until, featured_priority")
        .single();

      if (error) throw error;

      return NextResponse.json({ breeder, message: "Breeder unfeatured successfully." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("Admin featured breeders POST error:", err);
    return NextResponse.json({ error: err.message || "Unable to update featured status." }, { status: 500 });
  }
}
