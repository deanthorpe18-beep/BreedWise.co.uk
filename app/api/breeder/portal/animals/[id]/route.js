import { NextResponse } from "next/server";
import { authenticateBreederPortal } from "@/lib/breeder-portal-request-auth";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const auth = await authenticateBreederPortal(request);
  if (auth.response) return auth.response;

  const { data: animal, error } = await auth.adminClient
    .from("breeding_animals")
    .select("*")
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!animal) return NextResponse.json({ error: "Dog not found." }, { status: 404 });

  const [{ data: asSire }, { data: asDam }] = await Promise.all([
    auth.adminClient
      .from("breeding_litters")
      .select("id, litter_name, breed, birth_date, total_born, status")
      .eq("breeder_id", auth.breederId)
      .eq("sire_id", params.id)
      .order("birth_date", { ascending: false, nullsFirst: false }),
    auth.adminClient
      .from("breeding_litters")
      .select("id, litter_name, breed, birth_date, total_born, status")
      .eq("breeder_id", auth.breederId)
      .eq("dam_id", params.id)
      .order("birth_date", { ascending: false, nullsFirst: false }),
  ]);

  const litterIds = [...new Set([...(asSire || []).map((l) => l.id), ...(asDam || []).map((l) => l.id)])];
  let pupsCount = 0;
  if (litterIds.length > 0) {
    const { count } = await auth.adminClient
      .from("breeding_litter_animals")
      .select("*", { count: "exact", head: true })
      .eq("breeder_id", auth.breederId)
      .in("litter_id", litterIds);
    pupsCount = count || 0;
  }

  return NextResponse.json({
    animal,
    litters: {
      asSire: asSire || [],
      asDam: asDam || [],
      total: litterIds.length,
      pupsOnRecord: pupsCount,
    },
  });
}

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
