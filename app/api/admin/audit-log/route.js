import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const breederSlug = searchParams.get("breeder_slug") || "";
    const action = searchParams.get("action") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const adminClient = createAdminClient();
    let query = adminClient
      .from("breeder_audit_log")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (breederSlug) query = query.eq("breeder_slug", breederSlug);
    if (action) query = query.eq("action", action);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      logs: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unable to fetch audit log." }, { status: 500 });
  }
}
