import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function scoreBreeder(b) {
  let score = 0;
  let checks = [];

  if (b.description && b.description.length > 100) { score += 15; checks.push("description"); }
  else if (b.description) { score += 5; }

  if (b.phone) { score += 10; checks.push("phone"); }
  if (b.email) { score += 10; checks.push("email"); }
  if (b.website) { score += 10; checks.push("website"); }
  if (b.address) { score += 10; checks.push("address"); }
  if (b.photos && b.photos.length > 0) { score += 15; checks.push("photos"); }
  if (b.google_rating && b.google_rating > 0) { score += 15; checks.push("rating"); }
  if (b.breed_count && b.breed_count > 0) { score += 10; checks.push("breeds"); }
  if (b.claimed_at) { score += 5; checks.push("claimed"); }

  return { score, checks, tier: score >= 80 ? "excellent" : score >= 60 ? "good" : score >= 40 ? "fair" : "poor" };
}

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const minScore = parseInt(searchParams.get("min_score") || "0", 10);
    const maxScore = parseInt(searchParams.get("max_score") || "100", 10);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const adminClient = createAdminClient();

    const { count: totalPublic } = await adminClient
      .from("breeders")
      .select("*", { count: "exact", head: true })
      .in("status", ["public_listing", "claimed_profile"]);

    const [
      { count: missingEmail },
      { count: missingWebsite },
      { count: missingLat },
      { count: missingPhone },
      { count: unclaimed },
    ] = await Promise.all([
      adminClient.from("breeders").select("*", { count: "exact", head: true }).in("status", ["public_listing", "claimed_profile"]).or("email.is.null,email.eq."),
      adminClient.from("breeders").select("*", { count: "exact", head: true }).in("status", ["public_listing", "claimed_profile"]).or("website.is.null,website.eq."),
      adminClient.from("breeders").select("*", { count: "exact", head: true }).in("status", ["public_listing", "claimed_profile"]).or("lat.is.null,lng.is.null"),
      adminClient.from("breeders").select("*", { count: "exact", head: true }).in("status", ["public_listing", "claimed_profile"]).or("phone.is.null,phone.eq."),
      adminClient.from("breeders").select("*", { count: "exact", head: true }).eq("status", "public_listing"),
    ]);

    let query = adminClient
      .from("breeders")
      .select("id, name, slug, status, town, county, description, phone, email, website, address, photos, google_rating, claimed_at, membership_tier, lat, lng")
      .order("name");

    if (status) query = query.eq("status", status);

    const { data: breeders, error } = await query.limit(limit);
    if (error) throw error;

    const { data: breedData } = await adminClient.from("breeder_breeds").select("breeder_id, breed");
    const breedCounts = {};
    (breedData || []).forEach((b) => {
      breedCounts[b.breeder_id] = (breedCounts[b.breeder_id] || 0) + 1;
    });

    const scored = (breeders || []).map((b) => {
      const enriched = { ...b, breed_count: breedCounts[b.id] || 0 };
      const { score, checks, tier } = scoreBreeder(enriched);
      return { ...enriched, score, checks, tier };
    }).filter((b) => b.score >= minScore && b.score <= maxScore);

    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    scored.forEach((b) => distribution[b.tier]++);

    return NextResponse.json({
      total: scored.length,
      distribution,
      dataGaps: {
        totalPublic: totalPublic || 0,
        missingEmail: missingEmail || 0,
        missingWebsite: missingWebsite || 0,
        missingCoordinates: missingLat || 0,
        missingPhone: missingPhone || 0,
        unclaimed: unclaimed || 0,
      },
      listings: scored.sort((a, b) => a.score - b.score).slice(0, 50),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
