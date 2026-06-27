import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { trackingExcludedForUser } from "@/lib/analytics-track-guard";

function hashIp(ip) {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash << 5) - hash + ip.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

export async function POST(request) {
  try {
    if (await trackingExcludedForUser()) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limit = rateLimitByIp(`search-imp:${ip}`, 30, 60000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const slugs = (body.breeder_slugs || []).filter(Boolean).slice(0, 30);
    if (slugs.length === 0) {
      return NextResponse.json({ error: "breeder_slugs required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const userAgent = request.headers.get("user-agent") || "";
    const ipHash = hashIp(ip);

    await adminClient.from("cta_clicks").insert(
      slugs.map((breeder_slug) => ({
        breeder_slug,
        action_type: "search_impression",
        ip_hash: ipHash,
        user_agent: userAgent.slice(0, 500),
      }))
    );

    return NextResponse.json({ success: true, count: slugs.length });
  } catch {
    return NextResponse.json({ success: true });
  }
}
