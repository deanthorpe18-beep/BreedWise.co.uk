import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { syncTierToStripe, getAllTiersFromDB } from "@/lib/stripe-tiers";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const auth = await requireSuperAdmin();
  if (auth.error) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { tier } = body;

    if (tier) {
      // Sync a single tier
      const tiers = await getAllTiersFromDB();
      const tierConfig = tiers.find((t) => t.tier === tier);
      if (!tierConfig) {
        return NextResponse.json({ error: "Tier not found" }, { status: 404 });
      }

      const result = await syncTierToStripe(tier, tierConfig);
      return NextResponse.json({
        success: true,
        tier,
        stripeProductId: result.productId,
        stripePriceId: result.priceId,
      });
    }

    // Sync all tiers
    const tiers = await getAllTiersFromDB();
    const results = [];

    for (const t of tiers) {
      try {
        const result = await syncTierToStripe(t.tier, t);
        results.push({
          tier: t.tier,
          success: true,
          stripeProductId: result.productId,
          stripePriceId: result.priceId,
        });
      } catch (err) {
        console.error(`Failed to sync tier ${t.tier}:`, err);
        results.push({
          tier: t.tier,
          success: false,
          error: err.message,
        });
      }
    }

    const allSuccess = results.every((r) => r.success);
    return NextResponse.json({
      success: allSuccess,
      results,
    });
  } catch (err) {
    console.error("Stripe sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
