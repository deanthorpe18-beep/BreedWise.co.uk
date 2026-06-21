import { NextResponse } from "next/server";
import { authenticateBreederPortal } from "@/lib/breeder-portal-request-auth";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const auth = await authenticateBreederPortal(request);
  if (auth.response) return auth.response;

  const body = await request.json();
  const updates = { updated_at: new Date().toISOString() };
  const fields = ["name", "breed", "animal_type", "sex", "date_of_birth", "microchip", "registration_number", "colour", "notes", "is_active"];
  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f];
  }

  const { data, error } = await auth.adminClient
    .from("breeding_animals")
    .update(updates)
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ animal: data });
}

export async function DELETE(request, { params }) {
  const auth = await authenticateBreederPortal(request);
  if (auth.response) return auth.response;

  const { error } = await auth.adminClient
    .from("breeding_animals")
    .delete()
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
