import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const days = Math.min(parseInt(searchParams.get("days") || "30", 10), 90);
    const since = searchParams.get("since");

    const adminClient = createAdminClient();
    const sinceDate =
      since && !Number.isNaN(Date.parse(since))
        ? since
        : new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: profiles, error } = await adminClient
      .from("profiles")
      .select("id, display_name, role, created_at")
      .not("role", "in", "(admin,super_admin)")
      .gte("created_at", sinceDate)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const signups = [];
    for (const profile of profiles || []) {
      const { data: userData } = await adminClient.auth.admin.getUserById(profile.id);
      const user = userData?.user;
      if (!user) continue;

      signups.push({
        id: profile.id,
        display_name: profile.display_name || user.user_metadata?.display_name || null,
        email: user.email || "",
        role: profile.role || "breeder",
        account_intent: user.user_metadata?.account_intent || profile.role || "breeder",
        email_confirmed: Boolean(user.email_confirmed_at),
        created_at: profile.created_at,
      });
    }

    const { count: totalSince } = await adminClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("role", "in", "(admin,super_admin)")
      .gte("created_at", sinceDate);

    return NextResponse.json({
      signups,
      totalSince: totalSince || signups.length,
      since: sinceDate,
      limit,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unable to fetch signups." }, { status: 500 });
  }
}
