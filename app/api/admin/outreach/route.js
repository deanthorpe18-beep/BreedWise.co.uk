import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { sendClaimInvitation } from "@/lib/emails/resend";

/**
 * GET /api/admin/outreach
 * List unclaimed breeders available for outreach.
 */
export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("breeders")
      .select("id, slug, name, email, phone, website, status, claimed")
      .eq("status", "public_listing")
      .eq("claimed", false)
      .not("email", "is", null)
      .order("name", { ascending: true })
      .limit(50);

    if (error) throw error;

    // Fetch recent outreach sends for cooldown display
    const slugs = (data || []).map((b) => b.slug);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    let recentSends = [];
    if (slugs.length > 0) {
      const { data: sendsData } = await adminClient
        .from("outreach_sends")
        .select("breeder_slug, sent_at, status")
        .in("breeder_slug", slugs)
        .gte("sent_at", threeMonthsAgo.toISOString())
        .order("sent_at", { ascending: false });
      recentSends = sendsData || [];
    }

    // Map last send per breeder
    const lastSendBySlug = {};
    for (const s of recentSends) {
      if (!lastSendBySlug[s.breeder_slug]) {
        lastSendBySlug[s.breeder_slug] = s;
      }
    }

    const breeders = (data || []).map((b) => {
      const last = lastSendBySlug[b.slug];
      return {
        ...b,
        lastSentAt: last?.sent_at || null,
        onCooldown: !!last && last.status === "sent",
      };
    });

    return NextResponse.json({ breeders });
  } catch (err) {
    console.error("[outreach] GET error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Unable to fetch outreach list." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/outreach
 * Send claim invitation emails to unclaimed breeders.
 * Body: { breederSlugs: string[] } or { batchSize: number }
 * Enforces a 3-month cooldown per breeder.
 */
export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { breederSlugs, batchSize = 10 } = body;

    const adminClient = createAdminClient();

    let breeders = [];

    if (Array.isArray(breederSlugs) && breederSlugs.length > 0) {
      const { data, error } = await adminClient
        .from("breeders")
        .select("id, slug, name, email, phone, website, status")
        .in("slug", breederSlugs)
        .eq("status", "public_listing")
        .not("email", "is", null);

      if (error) throw error;
      breeders = data || [];
    } else {
      const { data, error } = await adminClient
        .from("breeders")
        .select("id, slug, name, email, phone, website, status")
        .eq("status", "public_listing")
        .not("email", "is", null)
        .limit(batchSize);

      if (error) throw error;
      breeders = data || [];
    }

    // Check which breeders are on cooldown (sent to within last 3 months)
    const slugs = breeders.map((b) => b.slug);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    let recentSends = [];
    if (slugs.length > 0) {
      const { data: sendsData } = await adminClient
        .from("outreach_sends")
        .select("breeder_slug, sent_at, status")
        .in("breeder_slug", slugs)
        .gte("sent_at", threeMonthsAgo.toISOString())
        .eq("status", "sent")
        .order("sent_at", { ascending: false });
      recentSends = sendsData || [];
    }

    const onCooldown = new Set(
      recentSends.map((s) => s.breeder_slug)
    );

    const results = [];
    for (const breeder of breeders) {
      const to = breeder.email;
      if (!to) {
        results.push({
          breederSlug: breeder.slug,
          breederName: breeder.name,
          sent: false,
          reason: "No contact email available",
        });
        continue;
      }

      if (onCooldown.has(breeder.slug)) {
        const lastSend = recentSends.find((s) => s.breeder_slug === breeder.slug);
        const cooldownDate = lastSend
          ? new Date(new Date(lastSend.sent_at).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB")
          : "in 3 months";
        results.push({
          breederSlug: breeder.slug,
          breederName: breeder.name,
          sent: false,
          to,
          reason: `Already contacted within last 3 months (cooldown until ${cooldownDate})`,
        });
        continue;
      }

      try {
        await sendClaimInvitation(to, breeder.name, breeder.slug);
        await adminClient.from("outreach_sends").insert({
          breeder_slug: breeder.slug,
          to_email: to,
          status: "sent",
        });
        results.push({
          breederSlug: breeder.slug,
          breederName: breeder.name,
          sent: true,
          to,
        });
      } catch (err) {
        console.error("[outreach] Failed to send to", to, err?.message);
        await adminClient.from("outreach_sends").insert({
          breeder_slug: breeder.slug,
          to_email: to,
          status: "failed",
          reason: err?.message || "Email send failed",
        });
        results.push({
          breederSlug: breeder.slug,
          breederName: breeder.name,
          sent: false,
          to,
          reason: err?.message || "Email send failed",
        });
      }
    }

    return NextResponse.json({
      sent: results.filter((r) => r.sent).length,
      failed: results.filter((r) => !r.sent).length,
      results,
    });
  } catch (err) {
    console.error("[outreach] Unexpected error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Unable to send outreach emails." },
      { status: 500 }
    );
  }
}
