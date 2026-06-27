import { NextResponse } from "next/server";
import { searchBreeders } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || "";
    const breederName = searchParams.get("name") || "";
    const animal = searchParams.get("animal") || "";
    const breedsParam = searchParams.getAll("breed");
    const breeds = breedsParam.length > 0 ? breedsParam : [];
    const maxDistance = searchParams.get("maxDistance") || "";
    const sortBy = searchParams.get("sort") || "relevance";
    const userLat = searchParams.get("userLat") || "";
    const userLng = searchParams.get("userLng") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    const result = await searchBreeders({
      query,
      breederName,
      animal,
      breeds,
      maxDistance,
      sortBy,
      userLat,
      userLng,
      page,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[search API] error:", err);
    return NextResponse.json(
      { error: "Search failed", breeders: [], totalCount: 0, totalPages: 0 },
      { status: 500 }
    );
  }
}
