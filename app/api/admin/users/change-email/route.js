import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden — super admin only" }, { status: 403 });
    }

    const { userId, newEmail } = await request.json();
    if (!userId || !newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json({ error: "Valid user ID and email required." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get old email for audit log
    const { data: oldProfile } = await adminClient
      .from("profiles")
      .select("email:auth.users!id(email)")
      .eq("id", userId)
      .single();

    const { data: updatedUser, error } = await adminClient.auth.admin.updateUserById(
      userId,
      { email: newEmail, email_confirm: true }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the change
    await adminClient.from("email_changes").insert({
      user_id: userId,
      old_email: oldProfile?.email || "unknown",
      new_email: newEmail,
      confirmed_at: new Date().toISOString(),
    });

    await adminClient.from("admin_audit_log").insert({
      admin_id: auth.user.id,
      action: "email_change",
      target_table: "auth.users",
      target_id: userId,
      old_values: { email: oldProfile?.email },
      new_values: { email: newEmail },
    });

    return NextResponse.json({
      message: "Email changed successfully.",
      userId: updatedUser.user.id,
      email: newEmail,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unable to change email." }, { status: 500 });
  }
}
