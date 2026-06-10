import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const q = searchParams.get("q") || "";

    const adminClient = createAdminClient();

    let query = adminClient
      .from("profiles")
      .select("id, display_name, role, created_at, updated_at", { count: "exact" })
      .not("role", "in", "(admin,super_admin)")
      .order("created_at", { ascending: false });

    const { data: profiles, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    // Fetch user details from auth for each profile
    const members = [];
    for (const p of (profiles || [])) {
      const { data: userData } = await adminClient.auth.admin.getUserById(p.id);
      const email = userData?.user?.email || "";
      
      // Apply search filter client-side since we need email from auth
      if (q) {
        const qLower = q.toLowerCase();
        const nameMatch = (p.display_name || "").toLowerCase().includes(qLower);
        const emailMatch = email.toLowerCase().includes(qLower);
        if (!nameMatch && !emailMatch) continue;
      }
      
      members.push({
        id: p.id,
        display_name: p.display_name,
        role: p.role,
        created_at: p.created_at,
        updated_at: p.updated_at,
        email,
      });
    }

    return NextResponse.json({
      members,
      total: count || members.length,
      limit,
      offset,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
