import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function GET(request, { params }) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimitByIp(ip, 30, 60000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
    }

    const { placeId } = await params;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    try {
        const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
            headers: {
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "id,displayName,rating,reviews,userRatingCount,formattedAddress,websiteUri,nationalPhoneNumber",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch place details");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
