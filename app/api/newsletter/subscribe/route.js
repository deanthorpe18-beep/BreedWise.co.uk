import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("newsletter_subscribers")
      .upsert({ email: email.toLowerCase(), subscribed_at: new Date().toISOString() }, { onConflict: "email" });

    if (error) {
      console.error("[newsletter] DB error:", error.message);
      return NextResponse.json({ error: "Unable to subscribe." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[newsletter] Unexpected error:", err?.message);
    return NextResponse.json({ error: "Unable to subscribe." }, { status: 500 });
  }
}
