import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getAllTiersFromDB, updateTierConfig } from "@/lib/stripe-tiers";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (auth.error) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const tiers = await getAllTiersFromDB();
    return NextResponse.json({ tiers });
  } catch (err) {
    console.error("Error fetching tiers:", err);
    return NextResponse.json({ error: "Failed to fetch tiers" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireSuperAdmin();
  if (auth.error) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { tier, updates } = body;

    if (!tier || !updates) {
      return NextResponse.json(
        { error: "tier and updates are required" },
        { status: 400 }
      );
    }

    const allowedFields = [
      "name",
      "monthly_price",
      "photo_limit",
      "search_priority",
      "features",
      "is_popular",
      "is_active",
    ];

    const dbUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        if (key === "features") {
          dbUpdates.features = Array.isArray(updates.features)
            ? updates.features
            : JSON.parse(updates.features);
        } else {
          dbUpdates[key] = updates[key];
        }
      }
    }

    const { error } = await updateTierConfig(tier, dbUpdates);
    if (error) {
      console.error("Error updating tier:", error);
      return NextResponse.json({ error: "Failed to update tier" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating tier:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
