import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { query, breed, animal, location, results_count, page } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const user_agent = request.headers.get("user-agent") || "";
    const ip_hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip))))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const adminClient = createAdminClient();
    await adminClient.from("search_analytics").insert({
      query: query || null,
      breed: breed || null,
      animal: animal || null,
      location: location || null,
      results_count: results_count || 0,
      page: page || 1,
      ip_hash,
      user_agent,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
