import { NextResponse } from "next/server";
import { authenticateBreederPortal } from "@/lib/breeder-portal-request-auth";
import { PUP_BASIC_FIELDS, PUP_SALE_FIELDS, canUseSaleFeatures, goldSaleRequiredResponse } from "@/lib/breeder-portal-sale";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const auth = await authenticateBreederPortal(request);
  if (auth.response) return auth.response;

  const body = await request.json();
  const updates = { updated_at: new Date().toISOString() };
  const saleFieldsRequested = PUP_SALE_FIELDS.some((f) => body[f] !== undefined);

  if (saleFieldsRequested && !canUseSaleFeatures(auth.access)) {
    const blocked = goldSaleRequiredResponse();
    return NextResponse.json({ error: blocked.error, goldRequired: true }, { status: blocked.status });
  }

  for (const f of PUP_BASIC_FIELDS) {
    if (body[f] !== undefined) updates[f] = body[f];
  }
  for (const f of PUP_SALE_FIELDS) {
    if (body[f] !== undefined) {
      if (f === "deposit_amount" || f === "sale_price") {
        updates[f] = body[f] === "" || body[f] == null ? null : Number(body[f]);
      } else {
        updates[f] = body[f];
      }
    }
  }

  const { data, error } = await auth.adminClient
    .from("breeding_litter_animals")
    .update(updates)
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ pup: data });
}

export async function DELETE(request, { params }) {
  const auth = await authenticateBreederPortal(request);
  if (auth.response) return auth.response;

  const { data: pup } = await auth.adminClient
    .from("breeding_litter_animals")
    .select("deposit_receipt_path, final_receipt_path")
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .maybeSingle();

  const { error } = await auth.adminClient
    .from("breeding_litter_animals")
    .delete()
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const paths = [pup?.deposit_receipt_path, pup?.final_receipt_path].filter(Boolean);
  if (paths.length) {
    await auth.adminClient.storage.from("claim-evidence").remove(paths);
  }

  return NextResponse.json({ success: true });
}
