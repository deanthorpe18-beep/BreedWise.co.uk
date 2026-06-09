import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden — super admin only" }, { status: 403 });
    }

    const { userId, newPassword } = await request.json();
    if (!userId || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "User ID and password (min 8 chars) required." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { data: updatedUser, error } = await adminClient.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await adminClient.from("admin_audit_log").insert({
      admin_id: auth.user.id,
      action: "password_reset",
      target_table: "auth.users",
      target_id: userId,
      new_values: { reset_by: auth.user.id },
    });

    return NextResponse.json({
      message: "Password reset successfully.",
      userId: updatedUser.user.id,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unable to reset password." }, { status: 500 });
  }
}
