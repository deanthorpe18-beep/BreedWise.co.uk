import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getCachedPlace, reviewsFromCacheRow } from "@/lib/google-places-sync";

export const dynamic = "force-dynamic";

/** DB/cache only — never calls Google Places (keeps profile-adjacent endpoints free). */
export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const supabase = createClient();

    const { data: breeder, error } = await supabase
      .from("breeders")
      .select("google_place_id, google_rating, google_review_count")
      .eq("slug", slug)
      .single();

    if (error || !breeder) {
      return NextResponse.json({ error: "Breeder not found" }, { status: 404 });
    }

    const rating = breeder.google_rating != null ? Number(breeder.google_rating) : null;
    const total_reviews = breeder.google_review_count || 0;
    let reviews = [];

    if (breeder.google_place_id) {
      const admin = createAdminClient();
      const cached = await getCachedPlace(admin, breeder.google_place_id);
      reviews = reviewsFromCacheRow(cached);
    }

    return NextResponse.json(
      { reviews, rating, total_reviews, _cached: true },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" } }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
