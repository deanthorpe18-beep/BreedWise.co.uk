import { NextResponse } from "next/server";
import { getAllTiersFromDB } from "@/lib/stripe-tiers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tiers = await getAllTiersFromDB();
    return NextResponse.json({ tiers });
  } catch (err) {
    console.error("Error fetching tiers:", err);
    return NextResponse.json({ error: "Failed to fetch tiers" }, { status: 500 });
  }
}
