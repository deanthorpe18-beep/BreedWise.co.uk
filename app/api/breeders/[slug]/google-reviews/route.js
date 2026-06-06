import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { slug } = await params;
        const supabase = createClient();

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

        const url = `https://places.googleapis.com/v1/places/${breeder.google_place_id}`;
        const res = await fetch(url, {
            headers: {
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "id,displayName,rating,reviews,userRatingCount",
            },
            next: { revalidate: 3600 },
        });

        if (!res.ok) {
            return NextResponse.json({ error: `Google API error: ${res.status}` }, { status: 502 });
        }

        const data = await res.json();

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
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
