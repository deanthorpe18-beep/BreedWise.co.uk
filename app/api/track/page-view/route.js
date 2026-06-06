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
    const { breeder_slug, page_path, referrer } = body;
    const ip = request.headers.get("x-forwarded-for") || "unknown";
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
