import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { sendNewsletterEmail } from "@/lib/emails/resend";
import { generateNewsletterDraft } from "@/lib/newsletter-content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = createAdminClient();
    const [{ data: campaigns }, { count: subscriberCount }] = await Promise.all([
      adminClient
        .from("newsletter_campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
      adminClient
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .is("unsubscribed_at", null),
    ]);

    return NextResponse.json({
      campaigns: campaigns || [],
      subscriberCount: subscriberCount || 0,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { action, campaignId, topic, subject, html_body, preview_text } = body;
    const adminClient = createAdminClient();

    if (action === "generate") {
      const draft = await generateNewsletterDraft(adminClient, topic || "weekly");
      const { data, error } = await adminClient
        .from("newsletter_campaigns")
        .insert({
          subject: draft.subject,
          preview_text: `[${draft.topic}] ${draft.preview_text}`.slice(0, 500),
          html_body: draft.html_body,
          text_body: draft.text_body,
          status: "draft",
          created_by: auth.user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ campaign: data });
    }

    if (action === "save") {
      if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });
      const { data, error } = await adminClient
        .from("newsletter_campaigns")
        .update({
          subject,
          html_body,
          preview_text,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ campaign: data });
    }

    if (action === "send") {
      if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

      const { data: campaign, error: campError } = await adminClient
        .from("newsletter_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();
      if (campError || !campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }
      if (campaign.status === "sent") {
        return NextResponse.json({ error: "Campaign already sent" }, { status: 400 });
      }

      const { data: subscribers, error: subError } = await adminClient
        .from("newsletter_subscribers")
        .select("email")
        .is("unsubscribed_at", null);
      if (subError) throw subError;

      const emails = (subscribers || []).map((s) => s.email).filter(Boolean);
      if (emails.length === 0) {
        return NextResponse.json({ error: "No active subscribers" }, { status: 400 });
      }

      let sent = 0;
      const batchSize = 50;
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        await Promise.all(
          batch.map((email) =>
            sendNewsletterEmail(email, campaign.subject, campaign.html_body, campaign.text_body)
          )
        );
        sent += batch.length;
      }

      await adminClient
        .from("newsletter_campaigns")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          recipient_count: sent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId);

      return NextResponse.json({ success: true, sent });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[newsletter admin]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
