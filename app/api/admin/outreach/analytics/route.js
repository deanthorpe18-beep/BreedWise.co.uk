import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

function outreachStage(send) {
  if (send.claimed_at) return "claimed";
  if (send.converted_at) return "signed_up";
  if (send.site_visited_at || send.first_clicked_at) return "visited";
  if (send.first_opened_at) return "opened";
  if (send.delivered_at || send.status === "sent") return "delivered";
  return "sent";
}

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get("days") || "90", 10), 365);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const adminClient = createAdminClient();

    const { data: sends, error } = await adminClient
      .from("outreach_sends")
      .select(
        "id, breeder_slug, to_email, sent_at, status, resend_id, delivered_at, first_opened_at, last_opened_at, open_count, first_clicked_at, last_clicked_at, click_count, site_visited_at, converted_at, converted_user_id, claimed_at"
      )
      .eq("status", "sent")
      .gte("sent_at", since)
      .order("sent_at", { ascending: false });

    if (error) throw error;

    const rows = sends || [];
    const slugs = [...new Set(rows.map((r) => r.breeder_slug))];
    let breederNames = {};
    if (slugs.length > 0) {
      const { data: breeders } = await adminClient
        .from("breeders")
        .select("slug, name, town, county")
        .in("slug", slugs);
      breederNames = Object.fromEntries((breeders || []).map((b) => [b.slug, b]));
    }

    const enriched = rows.map((s) => {
      const b = breederNames[s.breeder_slug] || {};
      const stage = outreachStage(s);
      return {
        ...s,
        breeder_name: b.name || s.breeder_slug,
        town: b.town,
        county: b.county,
        stage,
        opened: !!s.first_opened_at,
        clicked: !!s.first_clicked_at,
        visitedSite: !!s.site_visited_at,
        signedUp: !!s.converted_at,
        claimed: !!s.claimed_at,
      };
    });

    const summary = {
      sent: enriched.length,
      delivered: enriched.filter((s) => s.delivered_at).length,
      opened: enriched.filter((s) => s.opened).length,
      notOpened: enriched.filter((s) => !s.opened).length,
      clicked: enriched.filter((s) => s.clicked).length,
      openedNotClicked: enriched.filter((s) => s.opened && !s.clicked).length,
      visitedSite: enriched.filter((s) => s.visitedSite).length,
      clickedNotVisited: enriched.filter((s) => s.clicked && !s.visitedSite).length,
      signedUp: enriched.filter((s) => s.signedUp).length,
      notSignedUp: enriched.filter((s) => !s.signedUp).length,
      claimed: enriched.filter((s) => s.claimed).length,
      signedUpNotClaimed: enriched.filter((s) => s.signedUp && !s.claimed).length,
    };

    const rates = {
      openRate: summary.sent ? Math.round((summary.opened / summary.sent) * 100) : 0,
      clickRate: summary.sent ? Math.round((summary.clicked / summary.sent) * 100) : 0,
      visitRate: summary.sent ? Math.round((summary.visitedSite / summary.sent) * 100) : 0,
      signupRate: summary.sent ? Math.round((summary.signedUp / summary.sent) * 100) : 0,
      claimRate: summary.sent ? Math.round((summary.claimed / summary.sent) * 100) : 0,
    };

    const segments = {
      notOpened: enriched.filter((s) => !s.opened),
      openedNoClick: enriched.filter((s) => s.opened && !s.clicked),
      clickedNoSignup: enriched.filter((s) => (s.clicked || s.visitedSite) && !s.signedUp),
      signedUpNoClaim: enriched.filter((s) => s.signedUp && !s.claimed),
      completed: enriched.filter((s) => s.claimed),
    };

    return NextResponse.json({
      days,
      summary,
      rates,
      segments,
      recent: enriched.slice(0, 100),
      funnel: [
        { label: "Sent", count: summary.sent, pct: 100 },
        { label: "Delivered", count: summary.delivered, pct: rates.openRate },
        { label: "Opened", count: summary.opened, pct: summary.sent ? Math.round((summary.opened / summary.sent) * 100) : 0 },
        { label: "Clicked", count: summary.clicked, pct: rates.clickRate },
        { label: "Visited site", count: summary.visitedSite, pct: rates.visitRate },
        { label: "Signed up", count: summary.signedUp, pct: rates.signupRate },
        { label: "Claimed listing", count: summary.claimed, pct: rates.claimRate },
      ],
    });
  } catch (err) {
    console.error("[outreach/analytics]", err?.message || err);
    return NextResponse.json({ error: err.message || "Unable to fetch outreach analytics." }, { status: 500 });
  }
}
