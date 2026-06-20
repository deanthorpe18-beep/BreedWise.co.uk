import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const adminClient = createAdminClient();

    const { data: zeroResults } = await adminClient
      .from("search_analytics")
      .select("query, breed, location, searched_at, result_count")
      .eq("has_results", false)
      .gte("searched_at", since)
      .order("searched_at", { ascending: false })
      .limit(50);

    const { data: lowResults } = await adminClient
      .from("search_analytics")
      .select("query, breed, location, result_count, searched_at")
      .gt("result_count", 0)
      .lt("result_count", 3)
      .gte("searched_at", since)
      .order("searched_at", { ascending: false })
      .limit(50);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentSearches } = await adminClient
      .from("search_analytics")
      .select("breed")
      .gte("searched_at", weekAgo);

    const { data: priorSearches } = await adminClient
      .from("search_analytics")
      .select("breed")
      .gte("searched_at", twoWeeksAgo)
      .lt("searched_at", weekAgo);

    const recentCounts = {};
    const priorCounts = {};
    (recentSearches || []).forEach((s) => {
      if (s.breed) recentCounts[s.breed] = (recentCounts[s.breed] || 0) + 1;
    });
    (priorSearches || []).forEach((s) => {
      if (s.breed) priorCounts[s.breed] = (priorCounts[s.breed] || 0) + 1;
    });

    const trending = Object.entries(recentCounts)
      .map(([breed, count]) => ({
        breed,
        recent: count,
        prior: priorCounts[breed] || 0,
        change: ((count - (priorCounts[breed] || 0)) / Math.max(priorCounts[breed] || 1, 1) * 100).toFixed(0),
      }))
      .filter((t) => t.recent >= 2)
      .sort((a, b) => b.recent - a.recent)
      .slice(0, 10);

    const { data: allBreeds } = await adminClient.from("breeder_breeds").select("breed");
    const existingBreeds = new Set((allBreeds || []).map((b) => b.breed));

    const breedSearchCounts = {};
    (recentSearches || []).forEach((s) => {
      if (s.breed) breedSearchCounts[s.breed] = (breedSearchCounts[s.breed] || 0) + 1;
    });

    const breedGaps = Object.entries(breedSearchCounts)
      .filter(([breed]) => !existingBreeds.has(breed))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([breed, count]) => ({ breed, searchCount: count }));

    return NextResponse.json({
      zeroResults: zeroResults || [],
      lowResults: lowResults || [],
      trending,
      breedGaps,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
