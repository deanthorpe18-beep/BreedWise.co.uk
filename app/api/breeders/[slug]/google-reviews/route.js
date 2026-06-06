import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { slug } = await params;
        const supabase = createClient();

        // Get the breeder's google_place_id
        const { data: breeder, error } = await supabase
            .from("breeders")
            .select("google_place_id, name")
            .eq("slug", slug)
            .single();

        if (error || !breeder) {
            return NextResponse.json({ error: "Breeder not found" }, { status: 404 });
        }

        if (!breeder.google_place_id || breeder.google_place_id.startsWith("place-")) {
            return NextResponse.json({
                reviews: [],
                rating: null,
                total_reviews: 0,
                message: "No Google Place ID available for this breeder",
            });
        }

        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 });
        }

        const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
        url.searchParams.set("place_id", breeder.google_place_id);
        url.searchParams.set("fields", "name,rating,reviews,user_ratings_total,url");
        url.searchParams.set("key", apiKey);

        const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
        if (!res.ok) {
            return NextResponse.json({ error: `Google API error: ${res.status}` }, { status: 502 });
        }

        const json = await res.json();
        if (json.status !== "OK" || !json.result) {
            return NextResponse.json(
                { error: `Google API: ${json.status}`, details: json.error_message },
                { status: 502 }
            );
        }

        const result = json.result;
        const reviews = (result.reviews || []).map((r) => ({
            author_name: r.author_name,
            author_url: r.author_url,
            profile_photo_url: r.profile_photo_url,
            rating: r.rating,
            relative_time_description: r.relative_time_description,
            text: r.text,
            time: r.time,
        }));

        return NextResponse.json({
            reviews,
            rating: result.rating,
            total_reviews: result.user_ratings_total,
            google_url: result.url,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
