import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const breederSlug = searchParams.get("breeder_slug");
    const action = searchParams.get("action");

    const adminClient = createAdminClient();

    let query = adminClient
      .from("breeder_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (breederSlug) query = query.ilike("breeder_slug", `%${breederSlug}%`);
    if (action) query = query.eq("action", action);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      logs: data || [],
      total: data?.length || 0,
      limit,
      offset,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
