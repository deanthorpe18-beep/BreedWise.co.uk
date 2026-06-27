import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminKennelConfig } from "@/lib/admin-kennel";
import { deletePupReceipt, getPupReceiptUrl, uploadPupReceipt } from "@/lib/pup-receipt-storage";

export const dynamic = "force-dynamic";

async function resolveBreederId(adminClient) {
  const config = await getAdminKennelConfig(adminClient);
  if (!config?.id) return { error: NextResponse.json({ error: "My Kennel is not configured." }, { status: 400 }) };
  return { breederId: config.id };
}

export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = createAdminClient();
    const resolved = await resolveBreederId(adminClient);
    if (resolved.error) return resolved.error;

    const type = request.nextUrl.searchParams.get("type");
    const url = await getPupReceiptUrl(adminClient, {
      breederId: resolved.breederId,
      pupId: params.pupId,
      type,
    });
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Could not open receipt." }, { status: 404 });
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = createAdminClient();
    const resolved = await resolveBreederId(adminClient);
    if (resolved.error) return resolved.error;

    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type");

    const pup = await uploadPupReceipt(adminClient, {
      breederId: resolved.breederId,
      pupId: params.pupId,
      type,
      file,
    });

    return NextResponse.json({ pup });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Upload failed." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = createAdminClient();
    const resolved = await resolveBreederId(adminClient);
    if (resolved.error) return resolved.error;

    const type = request.nextUrl.searchParams.get("type");
    const pup = await deletePupReceipt(adminClient, {
      breederId: resolved.breederId,
      pupId: params.pupId,
      type,
    });

    return NextResponse.json({ pup });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Could not remove receipt." }, { status: 400 });
  }
}
