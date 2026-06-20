import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();

    // Find eligible Gold-tier featured breeders
    const now = new Date().toISOString();
    const { data: eligible, error: eligibleError } = await adminClient
      .from("breeders")
      .select("id, slug, name, town, county, hero_image_url, membership_tier, is_featured, featured_until, featured_priority")
      .eq("membership_tier", "gold")
      .eq("is_featured", true)
      .gt("featured_until", now)
      .eq("status", "claimed_profile")
      .order("featured_priority", { ascending: false })
      .limit(20);

    if (eligibleError) throw eligibleError;
    if (!eligible || eligible.length === 0) {
      return NextResponse.json({ breeders: [] });
    }

    // Get last shown timestamps from rotation log
    const breederIds = eligible.map((b) => b.id);
    const { data: rotationLogs, error: logError } = await adminClient
      .from("featured_rotation_log")
      .select("breeder_id, shown_at")
      .in("breeder_id", breederIds)
      .order("shown_at", { ascending: false });

    if (logError) throw logError;

    // Build map of breeder_id -> most recent shown_at
    const lastShownMap = new Map();
    for (const log of rotationLogs || []) {
      if (!lastShownMap.has(log.breeder_id)) {
        lastShownMap.set(log.breeder_id, log.shown_at);
      }
    }

    // Sort: never shown first, then least recently shown, then by priority
    const sorted = [...eligible].sort((a, b) => {
      const aShown = lastShownMap.get(a.id);
      const bShown = lastShownMap.get(b.id);

      if (!aShown && !bShown) {
        return (b.featured_priority || 0) - (a.featured_priority || 0);
      }
      if (!aShown) return -1;
      if (!bShown) return 1;
      return new Date(aShown) - new Date(bShown);
    });

    const selected = sorted.slice(0, 6);

    // Log rotation for selected breeders (fire-and-forget)
    const page = new URL(request.url).searchParams.get("page") || "home";
    const logEntries = selected.map((b, idx) => ({
      breeder_id: b.id,
      shown_at: now,
      shown_on_page: page,
      slot_position: idx + 1,
    }));

    // Don't await — log asynchronously so response isn't delayed
    adminClient.from("featured_rotation_log").insert(logEntries).catch((err) => {
      console.error("[featured-breeders] Rotation log error:", err?.message || err);
    });

    return NextResponse.json({ breeders: selected });
  } catch (err) {
    console.error("Featured breeders error:", err);
    return NextResponse.json({ error: "Unable to fetch featured breeders." }, { status: 500 });
  }
}
