import { NextResponse } from "next/server";
import { authenticateBreederPortalGold } from "@/lib/breeder-portal-request-auth";

export const dynamic = "force-dynamic";

const RECEIPT_TYPES = {
  deposit: "deposit_receipt_path",
  final: "final_receipt_path",
};

export async function GET(request, { params }) {
  const auth = await authenticateBreederPortalGold(request);
  if (auth.response) return auth.response;

  const type = request.nextUrl.searchParams.get("type");
  const column = RECEIPT_TYPES[type];
  if (!column) {
    return NextResponse.json({ error: "Specify type=deposit or type=final." }, { status: 400 });
  }

  const { data: pup, error } = await auth.adminClient
    .from("breeding_litter_animals")
    .select(column)
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!pup?.[column]) return NextResponse.json({ error: "No receipt uploaded." }, { status: 404 });

  const { data: signed, error: signError } = await auth.adminClient.storage
    .from("claim-evidence")
    .createSignedUrl(pup[column], 3600);

  if (signError) return NextResponse.json({ error: signError.message }, { status: 500 });
  return NextResponse.json({ url: signed.signedUrl });
}

export async function POST(request, { params }) {
  const auth = await authenticateBreederPortalGold(request);
  if (auth.response) return auth.response;

  const formData = await request.formData();
  const file = formData.get("file");
  const type = formData.get("type");

  const column = RECEIPT_TYPES[type];
  if (!column) {
    return NextResponse.json({ error: "Specify type=deposit or type=final." }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
  }
  const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF, JPG, or PNG allowed." }, { status: 400 });
  }

  const { data: existing } = await auth.adminClient
    .from("breeding_litter_animals")
    .select(`id, ${column}`)
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .maybeSingle();

  if (!existing) return NextResponse.json({ error: "Pup not found." }, { status: 404 });

  const ext = file.name.split(".").pop().toLowerCase();
  const filePath = `portal-receipts/${auth.breederId}/${params.id}/${type}-${Date.now()}.${ext}`;

  const { error: uploadError } = await auth.adminClient.storage
    .from("claim-evidence")
    .upload(filePath, file, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  if (existing[column]) {
    await auth.adminClient.storage.from("claim-evidence").remove([existing[column]]);
  }

  const { data, error } = await auth.adminClient
    .from("breeding_litter_animals")
    .update({ [column]: filePath, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pup: data });
}

export async function DELETE(request, { params }) {
  const auth = await authenticateBreederPortalGold(request);
  if (auth.response) return auth.response;

  const type = request.nextUrl.searchParams.get("type");
  const column = RECEIPT_TYPES[type];
  if (!column) {
    return NextResponse.json({ error: "Specify type=deposit or type=final." }, { status: 400 });
  }

  const { data: pup } = await auth.adminClient
    .from("breeding_litter_animals")
    .select(column)
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .maybeSingle();

  if (!pup?.[column]) return NextResponse.json({ error: "No receipt to remove." }, { status: 404 });

  await auth.adminClient.storage.from("claim-evidence").remove([pup[column]]);

  const { data, error } = await auth.adminClient
    .from("breeding_litter_animals")
    .update({ [column]: null, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pup: data });
}
