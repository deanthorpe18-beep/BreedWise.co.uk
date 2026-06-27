import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { trackingExcludedForUser } from "@/lib/analytics-track-guard";

export async function POST(request) {
  try {
    if (await trackingExcludedForUser()) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const limit = rateLimitByIp(ip, 120, 60000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const { session_id, page_path, duration_seconds } = body;
    if (!session_id || !page_path || !duration_seconds) {
      return NextResponse.json({ success: true });
    }

    const adminClient = createAdminClient();

    const { data: view } = await adminClient
      .from("page_views")
      .select("id, duration_seconds")
      .eq("session_id", session_id)
      .eq("page_path", page_path)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (view) {
      const merged = Math.max(view.duration_seconds || 0, duration_seconds);
      await adminClient
        .from("page_views")
        .update({ duration_seconds: merged })
        .eq("id", view.id);
    }

    const { data: session } = await adminClient
      .from("visitor_sessions")
      .select("id, total_duration_seconds")
      .eq("session_id", session_id)
      .maybeSingle();

    if (session) {
      await adminClient
        .from("visitor_sessions")
        .update({
          total_duration_seconds: (session.total_duration_seconds || 0) + duration_seconds,
          last_active_at: new Date().toISOString(),
        })
        .eq("id", session.id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
