import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import {
  loadAdminKennelSummary,
  setAdminKennelConfig,
  clearAdminKennelConfig,
  createStandaloneAdminKennel,
} from "@/lib/admin-kennel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = createAdminClient();
    const summary = await loadAdminKennelSummary(adminClient);
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unable to load kennel." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { action, breederId, breederName, name, town, county, region } = body;
    const adminClient = createAdminClient();

    if (action === "create-standalone") {
      await createStandaloneAdminKennel(adminClient, auth.user.id, { name, town, county, region });
      const summary = await loadAdminKennelSummary(adminClient);
      return NextResponse.json(summary);
    }

    if (action === "unlink") {
      await clearAdminKennelConfig(adminClient);
      return NextResponse.json({ configured: false });
    }

    const resolvedBreederId = breederId || body.breederId;
    if (!resolvedBreederId) {
      return NextResponse.json({ error: "breederId is required." }, { status: 400 });
    }

    const { data: breeder } = await adminClient
      .from("breeders")
      .select("id, name")
      .eq("id", resolvedBreederId)
      .maybeSingle();

    if (!breeder) {
      return NextResponse.json({ error: "Breeder listing not found." }, { status: 404 });
    }

    await setAdminKennelConfig(adminClient, breeder.id, breederName || breeder.name, "linked");
    const summary = await loadAdminKennelSummary(adminClient);
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unable to save kennel." }, { status: 500 });
  }
}
