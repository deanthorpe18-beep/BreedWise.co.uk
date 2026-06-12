import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const { count: totalClaims } = await adminClient.from("claims").select("*", { count: "exact", head: true });
    const { count: pendingClaims } = await adminClient.from("claims").select("*", { count: "exact", head: true }).eq("status", "pending");
    const { count: totalRemovals } = await adminClient.from("removals").select("*", { count: "exact", head: true });
    const { count: pendingRemovals } = await adminClient.from("removals").select("*", { count: "exact", head: true }).eq("status", "pending");
    const { count: totalUsers } = await adminClient.from("profiles").select("*", { count: "exact", head: true });

    return NextResponse.json({
      totalClaims: totalClaims || 0,
      pendingClaims: pendingClaims || 0,
      totalRemovals: totalRemovals || 0,
      pendingRemovals: pendingRemovals || 0,
      totalUsers: totalUsers || 0,
    });
  } catch (err) {
    return NextResponse.json({ error: "Unable to fetch stats." }, { status: 500 });
  }
}
