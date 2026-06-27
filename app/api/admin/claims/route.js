import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { sendClaimStatusUpdate } from "@/lib/emails/resend";
import { markOutreachClaimed } from "@/lib/outreach-tracking";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("claims")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ claims: data });
  } catch (err) {
    return NextResponse.json({ error: "Unable to fetch claims." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, admin_reason, admin_notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const updateData = {
      status,
      admin_reason: admin_reason || null,
      admin_notes: admin_notes || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.user.id,
    };

    const { data, error } = await adminClient
      .from("claims")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[claims/PATCH] DB error:", error.message, error.code, error.details);
      throw error;
    }

    // On approval: link claim to breeder profile and set up free tier
    if (status === "approved" && data?.breeder_slug) {
      const now = new Date().toISOString();

      // 1. Fetch breeder ID by slug (must exist)
      const { data: breederRow, error: breederErr } = await adminClient
        .from("breeders")
        .select("id")
        .eq("slug", data.breeder_slug)
        .maybeSingle();

      if (breederErr || !breederRow?.id) {
        console.error("[claims/PATCH] Breeder not found for slug:", data.breeder_slug);
        return NextResponse.json(
          { error: "Unable to approve claim: breeder profile not found." },
          { status: 404 }
        );
      }

      const breederId = breederRow.id;

      // 2. Update breeder record
      const { error: breederUpdateErr } = await adminClient
        .from("breeders")
        .update({
          status: "claimed_profile",
          claimed: true,
          claimed_at: now,
          membership_tier: "free",
        })
        .eq("id", breederId);

      if (breederUpdateErr) {
        console.error("[claims/PATCH] Breeder update error:", breederUpdateErr.message);
      }

      // 3. Create free-tier subscription row so dashboard API works
      if (data.claimant_user_id) {
        const { error: subErr } = await adminClient
          .from("breeder_subscriptions")
          .upsert({
            breeder_id: breederId,
            user_id: data.claimant_user_id,
            tier: "free",
            status: "active",
            created_at: now,
            updated_at: now,
          }, { onConflict: "breeder_id" });

        if (subErr) {
          console.error("[claims/PATCH] Subscription insert error:", subErr.message);
        }
      }

      await markOutreachClaimed(adminClient, data.breeder_slug, data.claimant_user_id);
    }

    // Send status update email to claimant asynchronously
    if (data?.claimant_email) {
      Promise.allSettled([
        sendClaimStatusUpdate(data.claimant_email, data.breeder_name || "your listing", status, admin_reason),
      ]);
    }

    return NextResponse.json({ claim: data });
  } catch (err) {
    console.error("[claims/PATCH] Unexpected error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Unable to update claim." }, { status: 500 });
  }
}
