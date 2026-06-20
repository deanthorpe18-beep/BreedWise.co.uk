import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getCachedPlace } from "@/lib/google-places-sync";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const supabase = createClient();

    const { data: breeder, error } = await supabase
      .from("breeders")
      .select("google_place_id, name, google_rating, google_review_count")
      .eq("slug", slug)
      .single();

    if (error || !breeder) {
      return NextResponse.json({ error: "Breeder not found" }, { status: 404 });
    }

    if (!breeder.google_place_id) {
      return NextResponse.json({
        reviews: [],
        rating: breeder.google_rating,
        total_reviews: breeder.google_review_count || 0,
        message: "No Google Place ID available for this breeder",
      });
    }

    const admin = createAdminClient();
    const cached = await getCachedPlace(admin, breeder.google_place_id);

    if (cached?.place_data) {
      const data = cached.place_data;
      const reviews = (data.reviews || []).map((r) => ({
        author_name: r.authorAttribution?.displayName || "Anonymous",
        author_url: r.authorAttribution?.uri || null,
        profile_photo_url: r.authorAttribution?.photoUri || null,
        rating: r.rating,
        relative_time_description: r.relativePublishTimeDescription,
        text: r.text?.text || "",
        time: r.publishTime,
      }));

      return NextResponse.json(
        {
          reviews,
          rating: data.rating ?? breeder.google_rating,
          total_reviews: data.userRatingCount ?? breeder.google_review_count,
          _cached: true,
        },
        { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" } }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 });
    }

    const url = `https://places.googleapis.com/v1/places/${breeder.google_place_id}`;
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,rating,reviews,userRatingCount",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Google API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();

    await admin.from("google_places_cache").upsert(
      {
        place_id: breeder.google_place_id,
        place_data: data,
        reviews_data: data.reviews || null,
        cached_at: new Date().toISOString(),
        refreshed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      },
      { onConflict: "place_id" }
    );

    const reviews = (data.reviews || []).map((r) => ({
      author_name: r.authorAttribution?.displayName || "Anonymous",
      author_url: r.authorAttribution?.uri || null,
      profile_photo_url: r.authorAttribution?.photoUri || null,
      rating: r.rating,
      relative_time_description: r.relativePublishTimeDescription,
      text: r.text?.text || "",
      time: r.publishTime,
    }));

    return NextResponse.json({
      reviews,
      rating: data.rating,
      total_reviews: data.userRatingCount,
      _cached: false,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
