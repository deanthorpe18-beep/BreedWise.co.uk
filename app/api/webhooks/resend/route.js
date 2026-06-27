import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySvixWebhook } from "@/lib/svix-verify";
import { handleResendWebhookEvent } from "@/lib/outreach-tracking";

export async function POST(request) {
  try {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    const payload = await request.text();
    const isProduction = process.env.RAILWAY_ENVIRONMENT === "production" || process.env.NODE_ENV === "production";

    if (!secret && isProduction) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }

    if (secret && !verifySvixWebhook(payload, request.headers, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const adminClient = createAdminClient();
    await handleResendWebhookEvent(adminClient, event);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[resend webhook]", err?.message || err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
