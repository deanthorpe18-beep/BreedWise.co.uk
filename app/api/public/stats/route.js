import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  try {
    const admin = createAdminClient();

    const [
      { count: breederCount },
      { count: claimedCount },
      { data: topBreeds },
      { data: topTowns },
    ] = await Promise.all([
      admin
        .from("breeders")
        .select("*", { count: "exact", head: true })
        .in("status", ["public_listing", "claimed_profile"]),
      admin
        .from("breeders")
        .select("*", { count: "exact", head: true })
        .eq("status", "claimed_profile"),
      admin
        .from("search_analytics")
        .select("breed")
        .not("breed", "is", null)
        .neq("breed", "")
        .order("searched_at", { ascending: false })
        .limit(200),
      admin
        .from("breeders")
        .select("town")
        .in("status", ["public_listing", "claimed_profile"])
        .not("town", "is", null)
        .limit(500),
    ]);

    const breedCounts = {};
    for (const row of topBreeds || []) {
      if (row.breed) breedCounts[row.breed] = (breedCounts[row.breed] || 0) + 1;
    }
    const trendingBreeds = Object.entries(breedCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([breed, count]) => ({ breed, count }));

    const townCounts = {};
    for (const row of topTowns || []) {
      if (row.town) townCounts[row.town] = (townCounts[row.town] || 0) + 1;
    }
    const popularTowns = Object.entries(townCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([town, count]) => ({ town, count }));

    return NextResponse.json(
      {
        breederCount: breederCount || 0,
        claimedCount: claimedCount || 0,
        trendingBreeds,
        popularTowns,
      },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } }
    );
  } catch (err) {
    console.error("[public/stats]", err?.message);
    return NextResponse.json({
      breederCount: 1632,
      claimedCount: 0,
      trendingBreeds: [],
      popularTowns: [],
    });
  }
}
