import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { sendClaimInvitation } from "@/lib/emails/resend";

/**
 * POST /api/admin/outreach
 * Send claim invitation emails to unclaimed breeders.
 * Body: { breederSlugs: string[] } or { batchSize: number }
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
      // Specific breeders
      const { data, error } = await adminClient
        .from("breeders")
        .select("id, slug, name, email, phone, website, status")
        .in("slug", breederSlugs)
        .eq("status", "public_listing");

      if (error) throw error;
      breeders = data || [];
    } else {
      // Batch of unclaimed breeders with an email or website (best effort)
      const { data, error } = await adminClient
        .from("breeders")
        .select("id, slug, name, email, phone, website, status")
        .eq("status", "public_listing")
        .or("email.not.is.null,website.not.is.null")
        .limit(batchSize);

      if (error) throw error;
      breeders = data || [];
    }

    const results = [];
    for (const breeder of breeders) {
      // Try to find a contact email
      let to = breeder.email;
      if (!to && breeder.website) {
        // Best-effort: guess info@domain from website
        try {
          const url = new URL(breeder.website);
          to = `info@${url.hostname.replace(/^www\./, "")}`;
        } catch {
          to = null;
        }
      }

      if (!to) {
        results.push({
          breederSlug: breeder.slug,
          breederName: breeder.name,
          sent: false,
          reason: "No contact email available",
        });
        continue;
      }

      try {
        await sendClaimInvitation(to, breeder.name, breeder.slug);
        results.push({
          breederSlug: breeder.slug,
          breederName: breeder.name,
          sent: true,
          to,
        });
      } catch (err) {
        console.error("[outreach] Failed to send to", to, err?.message);
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
