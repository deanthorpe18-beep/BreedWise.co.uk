import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { trackingExcludedForUser } from "@/lib/analytics-track-guard";

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
    if (await trackingExcludedForUser()) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const forwarded = request.headers.get("x-forwarded-for") || "unknown";
    const ip = forwarded.split(",")[0].trim();
    const limit = rateLimitByIp(ip, 60, 60000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      session_id,
      page_path,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body;
    const userAgent = request.headers.get("user-agent") || "";
    const ipHash = hashIp(ip);
    const now = new Date().toISOString();

    const adminClient = createAdminClient();

    const { data: existing } = await adminClient
      .from("user_sessions")
      .select("id")
      .eq("ip_hash", ipHash)
      .maybeSingle();

    if (existing) {
      await adminClient
        .from("user_sessions")
        .update({ last_active_at: now, user_agent: userAgent.slice(0, 500) })
        .eq("id", existing.id);
    } else {
      await adminClient.from("user_sessions").insert({
        ip_hash: ipHash,
        user_agent: userAgent.slice(0, 500),
        last_active_at: now,
      });
    }

    if (session_id) {
      const { data: vs } = await adminClient
        .from("visitor_sessions")
        .select("id")
        .eq("session_id", session_id)
        .maybeSingle();

      if (vs) {
        await adminClient
          .from("visitor_sessions")
          .update({ last_active_at: now })
          .eq("id", vs.id);
      } else {
        await adminClient.from("visitor_sessions").insert({
          session_id,
          ip_hash: ipHash,
          user_agent: userAgent.slice(0, 500),
          entry_path: page_path || null,
          referrer: referrer || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
