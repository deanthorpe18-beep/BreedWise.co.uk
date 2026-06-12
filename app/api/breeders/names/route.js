import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "2000", 10), 5000);

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("breeders")
      .select("slug, name, town, county")
      .in("status", ["public_listing", "claimed_profile"])
      .order("name", { ascending: true })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ breeders: data || [] });
  } catch {
    return NextResponse.json({ breeders: [] });
  }
}
