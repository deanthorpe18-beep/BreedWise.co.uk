import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const limit = rateLimitByIp(ip, 200, 60000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const { session_id, page_path, element_text, element_href, event_type = "click" } = body;
    if (!session_id) return NextResponse.json({ success: true });

    const adminClient = createAdminClient();
    await adminClient.from("visitor_events").insert({
      session_id,
      event_type: ["click", "cta", "scroll_depth"].includes(event_type) ? event_type : "click",
      page_path: page_path || null,
      element_text: element_text || null,
      element_href: element_href || null,
    });

    const { data: session } = await adminClient
      .from("visitor_sessions")
      .select("id, click_count")
      .eq("session_id", session_id)
      .maybeSingle();

    if (session) {
      await adminClient
        .from("visitor_sessions")
        .update({
          click_count: (session.click_count || 0) + 1,
          last_active_at: new Date().toISOString(),
        })
        .eq("id", session.id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
