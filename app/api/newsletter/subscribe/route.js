import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimitByIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limited = rateLimitByIp(`newsletter:${ip}`, 5, 60_000);
    if (!limited.allowed) {
      return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const normalized = email.toLowerCase().trim();

    const { error } = await adminClient
      .from("newsletter_subscribers")
      .upsert(
        {
          email: normalized,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
          source: "website",
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error("[newsletter] DB error:", error.message);
      return NextResponse.json({ error: "Unable to subscribe. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[newsletter] Unexpected error:", err?.message);
    return NextResponse.json({ error: "Unable to subscribe." }, { status: 500 });
  }
}
