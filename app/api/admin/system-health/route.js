import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = createAdminClient();
    const checks = [];

    // Database connectivity
    const dbStart = Date.now();
    const { data: dbTest, error: dbError } = await adminClient.from("breeders").select("id", { count: "exact", head: true });
    checks.push({
      name: "Database",
      status: dbError ? "error" : "ok",
      latency: Date.now() - dbStart,
      detail: dbError ? dbError.message : `${dbTest} breeders in DB`,
    });

    // Auth table health
    const { count: userCount, error: authError } = await adminClient
      .from("users")
      .select("*", { count: "exact", head: true });
    checks.push({
      name: "Auth",
      status: authError ? "error" : "ok",
      detail: authError ? authError.message : `${userCount || 0} registered users`,
    });

    // Recent errors (check for 500s in last hour via page_views table heuristic — no error table yet)
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentViews } = await adminClient
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", hourAgo);

    checks.push({
      name: "Analytics ingestion",
      status: (recentViews || 0) > 0 ? "ok" : "warning",
      detail: `${recentViews || 0} page views in last hour`,
    });

    // Search analytics health
    const { count: recentSearches } = await adminClient
      .from("search_analytics")
      .select("*", { count: "exact", head: true })
      .gte("created_at", hourAgo);

    checks.push({
      name: "Search analytics",
      status: (recentSearches || 0) > 0 ? "ok" : "warning",
      detail: `${recentSearches || 0} searches in last hour`,
    });

    // Unprocessed claim queue
    const { count: pendingClaims } = await adminClient
      .from("claim_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    checks.push({
      name: "Claim queue",
      status: (pendingClaims || 0) > 10 ? "warning" : "ok",
      detail: `${pendingClaims || 0} pending claims`,
    });

    // CTA click tracking
    const { count: recentCtas } = await adminClient
      .from("cta_clicks")
      .select("*", { count: "exact", head: true })
      .gte("created_at", hourAgo);

    checks.push({
      name: "CTA tracking",
      status: (recentCtas || 0) > 0 ? "ok" : "warning",
      detail: `${recentCtas || 0} CTA clicks in last hour`,
    });

    const allOk = checks.every((c) => c.status === "ok");

    return NextResponse.json({
      overall: allOk ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ overall: "error", error: err.message, checks: [] }, { status: 500 });
  }
}
