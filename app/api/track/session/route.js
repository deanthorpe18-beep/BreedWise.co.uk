import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimitByIp } from "@/lib/rate-limit";

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
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimitByIp(ip, 60, 60000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
    }

    const userAgent = request.headers.get("user-agent") || "";

    const ipHash = hashIp(ip);

    const adminClient = createAdminClient();

    // Upsert session - update last_active if exists, insert if not
    const { data: existing } = await adminClient
      .from("user_sessions")
      .select("id")
      .eq("ip_hash", ipHash)
      .maybeSingle();

    if (existing) {
      await adminClient
        .from("user_sessions")
        .update({ last_active_at: new Date().toISOString(), user_agent: userAgent.slice(0, 500) })
        .eq("id", existing.id);
    } else {
      await adminClient.from("user_sessions").insert({
        ip_hash: ipHash,
        user_agent: userAgent.slice(0, 500),
        last_active_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
