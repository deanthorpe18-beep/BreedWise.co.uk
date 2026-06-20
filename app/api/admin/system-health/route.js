import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = createAdminClient();
    const checks = [];

    // Database connectivity + breeder count
    const dbStart = Date.now();
    const { count: breederCount, error: dbError } = await adminClient
      .from("breeders")
      .select("id", { count: "exact", head: true });
    checks.push({
      name: "Database",
      status: dbError ? "error" : "ok",
      latency: Date.now() - dbStart,
      detail: dbError ? dbError.message : `${breederCount ?? 0} breeders in DB`,
    });

    // Registered users (profiles table is reliable; auth.admin.listUsers has no total field)
    const { count: userCount, error: userError } = await adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true });
    checks.push({
      name: "Auth",
      status: userError ? "error" : "ok",
      detail: userError ? userError.message : `${userCount ?? 0} registered users`,
    });

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count: recentViews, error: viewsError } = await adminClient
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", hourAgo);
    checks.push({
      name: "Analytics ingestion",
      status: viewsError ? "error" : "ok",
      detail: viewsError ? viewsError.message : `${recentViews ?? 0} page views in last hour`,
    });

    const { count: recentSearches, error: searchError } = await adminClient
      .from("search_analytics")
      .select("*", { count: "exact", head: true })
      .gte("searched_at", hourAgo);
    checks.push({
      name: "Search analytics",
      status: searchError ? "error" : "ok",
      detail: searchError ? searchError.message : `${recentSearches ?? 0} searches in last hour`,
    });

    const { count: pendingClaims, error: claimsError } = await adminClient
      .from("claims")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    checks.push({
      name: "Claim queue",
      status: claimsError ? "error" : (pendingClaims || 0) > 10 ? "warning" : "ok",
      detail: claimsError ? claimsError.message : `${pendingClaims ?? 0} pending claims`,
    });

    const { count: recentCtas, error: ctaError } = await adminClient
      .from("cta_clicks")
      .select("*", { count: "exact", head: true })
      .gte("created_at", hourAgo);
    checks.push({
      name: "CTA tracking",
      status: ctaError ? "error" : "ok",
      detail: ctaError ? ctaError.message : `${recentCtas ?? 0} CTA clicks in last hour`,
    });

    // Stripe configuration
    const stripeSecretSet = Boolean(process.env.STRIPE_SECRET_KEY);
    const stripeWebhookSet = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
    const { data: stripeTiers, error: tiersError } = await adminClient
      .from("stripe_tiers")
      .select("tier, stripe_price_id, is_active")
      .eq("is_active", true);
    const tiersWithPrices = (stripeTiers || []).filter((t) => t.stripe_price_id);
    checks.push({
      name: "Stripe",
      status: tiersError
        ? "error"
        : stripeSecretSet && stripeWebhookSet && tiersWithPrices.length >= 3
          ? "ok"
          : "warning",
      detail: tiersError
        ? tiersError.message
        : stripeSecretSet && stripeWebhookSet
          ? `${tiersWithPrices.length}/3 active tiers have Stripe price IDs`
          : `Missing env: ${!stripeSecretSet ? "STRIPE_SECRET_KEY " : ""}${!stripeWebhookSet ? "STRIPE_WEBHOOK_SECRET" : ""}`.trim(),
    });

    // Migration 028 — breeder availability_status column
    const { error: availabilityError } = await adminClient
      .from("breeders")
      .select("availability_status")
      .limit(1);
    checks.push({
      name: "Migration 028 (availability)",
      status: availabilityError ? "warning" : "ok",
      detail: availabilityError
        ? "Column missing — run supabase/migrations/028_breeder_availability.sql"
        : "availability_status column present",
    });

    const hasError = checks.some((c) => c.status === "error");
    const hasWarning = checks.some((c) => c.status === "warning");
    const overall = hasError ? "error" : hasWarning ? "degraded" : "healthy";

    return NextResponse.json({
      overall,
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ overall: "error", error: err.message, checks: [] }, { status: 500 });
  }
}
