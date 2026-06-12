import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { sendClaimStatusUpdate } from "@/lib/emails/resend";

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

    const { data, error } = await adminClient
      .from("claims")
      .update({ status, admin_reason: admin_reason || null, admin_notes: admin_notes || null, reviewed_at: new Date().toISOString(), reviewed_by: auth.user.id, status_update_sent_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Send status update email to claimant asynchronously
    if (data?.claimant_email) {
      Promise.allSettled([
        sendClaimStatusUpdate(data.claimant_email, data.breeder_name || "your listing", status, admin_reason),
      ]);
    }

    return NextResponse.json({ claim: data });
  } catch (err) {
    return NextResponse.json({ error: "Unable to update claim." }, { status: 500 });
  }
}
