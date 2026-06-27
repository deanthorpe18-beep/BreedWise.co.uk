import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getBreederHeroUrl } from "@/lib/breeder-images";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    const [{ data: goldFeatured, error: goldError }, { data: silverPool, error: silverError }] =
      await Promise.all([
        adminClient
          .from("breeders")
          .select(
            "id, slug, name, town, county, hero_image_url, google_photo_urls, membership_tier, is_featured, featured_until, featured_priority, breeder_photos(photo_url, is_primary)"
          )
          .eq("membership_tier", "gold")
          .eq("is_featured", true)
          .gt("featured_until", now)
          .eq("status", "claimed_profile")
          .order("featured_priority", { ascending: false })
          .limit(12),
        adminClient
          .from("breeders")
          .select(
            "id, slug, name, town, county, hero_image_url, google_photo_urls, membership_tier, is_featured, featured_until, featured_priority, breeder_photos(photo_url, is_primary)"
          )
          .eq("membership_tier", "silver")
          .eq("status", "claimed_profile")
          .limit(20),
      ]);

    if (goldError) throw goldError;
    if (silverError) throw silverError;

    const eligible = [...(goldFeatured || []), ...(silverPool || [])];
    if (eligible.length === 0) {
      return NextResponse.json({ breeders: [] });
    }

    const breederIds = eligible.map((b) => b.id);
    const { data: rotationLogs, error: logError } = await adminClient
      .from("featured_rotation_log")
      .select("breeder_id, shown_at")
      .in("breeder_id", breederIds)
      .order("shown_at", { ascending: false });

    if (logError) throw logError;

    const lastShownMap = new Map();
    for (const log of rotationLogs || []) {
      if (!lastShownMap.has(log.breeder_id)) {
        lastShownMap.set(log.breeder_id, log.shown_at);
      }
    }

    const sorted = [...eligible].sort((a, b) => {
      const tierScore = (t) => (t === "gold" ? 2 : 1);
      const tierDiff = tierScore(b.membership_tier) - tierScore(a.membership_tier);
      if (tierDiff !== 0) return tierDiff;

      const aShown = lastShownMap.get(a.id);
      const bShown = lastShownMap.get(b.id);
      if (!aShown && !bShown) {
        return (b.featured_priority || 0) - (a.featured_priority || 0);
      }
      if (!aShown) return -1;
      if (!bShown) return 1;
      return new Date(aShown) - new Date(bShown);
    });

    const selected = sorted.slice(0, 6).map((b) => ({
      ...b,
      hero_image_url: getBreederHeroUrl(b),
    }));

    const page = new URL(request.url).searchParams.get("page") || "home";
    const logEntries = selected.map((b, idx) => ({
      breeder_id: b.id,
      shown_at: now,
      shown_on_page: page,
      slot_position: idx + 1,
    }));

    adminClient.from("featured_rotation_log").insert(logEntries).catch((err) => {
      console.error("[featured-breeders] Rotation log error:", err?.message || err);
    });

    return NextResponse.json({ breeders: selected });
  } catch (err) {
    console.error("Featured breeders error:", err);
    return NextResponse.json({ error: "Unable to fetch featured breeders." }, { status: 500 });
  }
}
