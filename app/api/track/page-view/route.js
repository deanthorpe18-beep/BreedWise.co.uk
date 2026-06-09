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

    const body = await request.json();
    const { breeder_slug, page_path, referrer } = body;
    const userAgent = request.headers.get("user-agent") || "";


    const adminClient = createAdminClient();
    await adminClient.from("page_views").insert({
      breeder_slug: breeder_slug || null,
      page_path: page_path || request.headers.get("referer") || "",
      ip_hash: hashIp(ip),
      user_agent: userAgent.slice(0, 500),
      referrer: referrer || null,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
