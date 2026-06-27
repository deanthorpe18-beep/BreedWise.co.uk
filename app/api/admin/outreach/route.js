import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { sendClaimInvitation } from "@/lib/emails/resend";
import { isValidBreederEmail, normalizeBreederEmail } from "@/lib/breeder-email-utils";

const PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;

function sanitizeSearch(q) {
  return String(q || "")
    .trim()
    .replace(/[%_(),&]/g, "")
    .slice(0, 80);
}

async function loadOutreachCandidates(adminClient, { slugs = null, search = "" } = {}) {
  let query = adminClient
    .from("breeders")
    .select("id, slug, name, email, phone, website, status, claimed, town, county")
    .eq("status", "public_listing")
    .eq("claimed", false)
    .not("email", "is", null)
    .neq("email", "")
    .order("name", { ascending: true });

  if (Array.isArray(slugs) && slugs.length > 0) {
    query = query.in("slug", slugs);
  } else {
    const term = sanitizeSearch(search);
    if (term) {
      query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,town.ilike.%${term}%,county.ilike.%${term}%,slug.ilike.%${term}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || [])
    .map((b) => ({ ...b, email: normalizeBreederEmail(b.email) }))
    .filter((b) => isValidBreederEmail(b.email));
}

async function attachOutreachMeta(adminClient, breeders) {
  const slugs = breeders.map((b) => b.slug);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  let recentSends = [];
  if (slugs.length > 0) {
    const { data: sendsData } = await adminClient
      .from("outreach_sends")
      .select("breeder_slug, sent_at, status, converted_at")
      .in("breeder_slug", slugs)
      .gte("sent_at", threeMonthsAgo.toISOString())
      .order("sent_at", { ascending: false });
    recentSends = sendsData || [];
  }

  const lastSendBySlug = {};
  for (const s of recentSends) {
    if (!lastSendBySlug[s.breeder_slug]) {
      lastSendBySlug[s.breeder_slug] = s;
    }
  }

  return breeders.map((b) => {
    const last = lastSendBySlug[b.slug];
    return {
      ...b,
      lastSentAt: last?.sent_at || null,
      onCooldown: !!last && last.status === "sent" && !last.converted_at,
      convertedAt: last?.converted_at || null,
      outreachConverted: !!last?.converted_at,
    };
  });
}

function paginateList(items, page, limit) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * limit;
  return {
    items: items.slice(offset, offset + limit),
    total,
    page: safePage,
    limit,
    totalPages,
    offset,
  };
}

/**
 * GET /api/admin/outreach?page=1&limit=100&q=search
 * List unclaimed breeders available for outreach.
 */
export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get("limit") || String(PAGE_SIZE), 10) || PAGE_SIZE)
    );
    const search = sanitizeSearch(searchParams.get("q"));

    const adminClient = createAdminClient();
    const allCandidates = await loadOutreachCandidates(adminClient, { search });
    const { items, total, totalPages, page: safePage } = paginateList(allCandidates, page, limit);
    const breeders = await attachOutreachMeta(adminClient, items);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: weekSends } = await adminClient
      .from("outreach_sends")
      .select("converted_at, status")
      .gte("sent_at", weekAgo)
      .eq("status", "sent");

    const weekStats = {
      sent: (weekSends || []).length,
      converted: (weekSends || []).filter((s) => s.converted_at).length,
      awaiting: (weekSends || []).filter((s) => !s.converted_at).length,
    };

    return NextResponse.json({
      breeders,
      total,
      showing: breeders.length,
      page: safePage,
      limit,
      totalPages,
      search,
      weekStats,
    });
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
      breeders = await loadOutreachCandidates(adminClient, {
        slugs: breederSlugs,
      });
    } else {
      const all = await loadOutreachCandidates(adminClient);
      breeders = all.slice(0, Math.min(batchSize, PAGE_SIZE));
    }

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

    const onCooldown = new Set(recentSends.map((s) => s.breeder_slug));

    const results = [];
    for (const breeder of breeders) {
      const to = normalizeBreederEmail(breeder.email);
      if (!to || !isValidBreederEmail(to)) {
        results.push({
          breederSlug: breeder.slug,
          breederName: breeder.name,
          sent: false,
          reason: "Invalid or missing contact email",
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
        const resendId = await sendClaimInvitation(to, breeder.name, breeder.slug);
        await adminClient.from("outreach_sends").insert({
          breeder_slug: breeder.slug,
          to_email: to,
          status: "sent",
          resend_id: resendId || null,
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
