import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/**
 * POST /api/admin/fix-claimed-breeders
 * Backfill claimed_at, membership_tier, and breeder_subscriptions
 * for all approved claims where the breeder hasn't been properly linked.
 */
export async function POST() {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    // 1. Find all approved claims
    const { data: claims, error: claimsErr } = await adminClient
      .from("claims")
      .select("id, breeder_slug, claimant_user_id, breeder_name, reviewed_at")
      .eq("status", "approved");

    if (claimsErr) throw claimsErr;

    const results = { breedersFixed: 0, subscriptionsCreated: 0, errors: [] };

    for (const claim of claims || []) {
      if (!claim.breeder_slug) continue;

      // Get breeder
      const { data: breeder } = await adminClient
        .from("breeders")
        .select("id, status, claimed_at, membership_tier")
        .eq("slug", claim.breeder_slug)
        .maybeSingle();

      if (!breeder) {
        results.errors.push(`Breeder not found for slug: ${claim.breeder_slug}`);
        continue;
      }

      // Fix breeder record if needed
      const needsUpdate =
        breeder.status !== "claimed_profile" ||
        !breeder.claimed_at ||
        !breeder.membership_tier;

      if (needsUpdate) {
        const { error: updErr } = await adminClient
          .from("breeders")
          .update({
            status: "claimed_profile",
            claimed: true,
            claimed_at: breeder.claimed_at || claim.reviewed_at || now,
            membership_tier: breeder.membership_tier || "free",
          })
          .eq("id", breeder.id);

        if (updErr) {
          results.errors.push(`Failed to update breeder ${breeder.id}: ${updErr.message}`);
        } else {
          results.breedersFixed++;
        }
      }

      // Create subscription if needed
      if (claim.claimant_user_id) {
        const { data: existingSub } = await adminClient
          .from("breeder_subscriptions")
          .select("id")
          .eq("breeder_id", breeder.id)
          .maybeSingle();

        if (!existingSub) {
          const { error: subErr } = await adminClient
            .from("breeder_subscriptions")
            .insert({
              breeder_id: breeder.id,
              user_id: claim.claimant_user_id,
              tier: "free",
              status: "active",
              created_at: claim.reviewed_at || now,
              updated_at: now,
            });

          if (subErr) {
            results.errors.push(`Failed to create subscription for breeder ${breeder.id}: ${subErr.message}`);
          } else {
            results.subscriptionsCreated++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      claimsProcessed: (claims || []).length,
      ...results,
    });
  } catch (err) {
    console.error("[fix-claimed-breeders] Error:", err?.message);
    return NextResponse.json({ error: err?.message || "Backfill failed." }, { status: 500 });
  }
}
