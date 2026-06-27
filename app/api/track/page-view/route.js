import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { markOutreachSiteVisit } from "@/lib/outreach-tracking";

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
    const forwarded = request.headers.get("x-forwarded-for") || "unknown";
    const ip = forwarded.split(",")[0].trim();
    const limit = rateLimitByIp(ip, 120, 60000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const {
      breeder_slug,
      page_path,
      referrer,
      session_id,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body;
    const userAgent = request.headers.get("user-agent") || "";
    const ipHash = hashIp(ip);
    const path = page_path || "";

    const adminClient = createAdminClient();
    await adminClient.from("page_views").insert({
      breeder_slug: breeder_slug || null,
      page_path: path,
      ip_hash: ipHash,
      user_agent: userAgent.slice(0, 500),
      referrer: referrer || null,
      session_id: session_id || null,
    });

    if (session_id) {
      const { data: existing } = await adminClient
        .from("visitor_sessions")
        .select("id, page_count")
        .eq("session_id", session_id)
        .maybeSingle();

      const now = new Date().toISOString();
      if (existing) {
        await adminClient
          .from("visitor_sessions")
          .update({
            last_active_at: now,
            page_count: (existing.page_count || 0) + 1,
          })
          .eq("id", existing.id);
      } else {
        await adminClient.from("visitor_sessions").insert({
          session_id,
          ip_hash: ipHash,
          user_agent: userAgent.slice(0, 500),
          entry_path: path,
          referrer: referrer || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          page_count: 1,
        });
      }
    }

    const isOutreach =
      path.includes("source=outreach") ||
      utm_source === "outreach" ||
      path.includes("/claim/welcome") ||
      (path.includes("/auth/signup") && path.includes("slug="));
    if (isOutreach) {
      const slugMatch = path.match(/[?&]slug=([^&]+)/);
      const breederSlug = slugMatch ? decodeURIComponent(slugMatch[1]) : breeder_slug;
      await markOutreachSiteVisit(adminClient, { breederSlug });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
