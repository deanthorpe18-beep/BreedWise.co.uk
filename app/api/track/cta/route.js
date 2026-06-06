import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function hashIp(ip) {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { breeder_slug, action_type } = body;
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    if (!breeder_slug || !action_type) {
      return NextResponse.json({ error: "breeder_slug and action_type required" }, { status: 400 });
    }

    const validActions = ["call", "website", "save", "claim", "email", "directions"];
    if (!validActions.includes(action_type)) {
      return NextResponse.json({ error: "Invalid action_type" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    await adminClient.from("cta_clicks").insert({
      breeder_slug,
      action_type,
      ip_hash: hashIp(ip),
      user_agent: userAgent.slice(0, 500),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
