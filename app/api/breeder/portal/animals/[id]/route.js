import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireBreederPortal } from "@/lib/breeder-auth";

export const dynamic = "force-dynamic";

async function authPortal() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: "Please log in." }, { status: 401 }) };
  const adminClient = createAdminClient();
  const portal = await requireBreederPortal(adminClient, user.id, user.email);
  if (portal.error) {
    return { response: NextResponse.json({ error: portal.error }, { status: portal.status }) };
  }
  return { adminClient, breederId: portal.breederId };
}

export async function PATCH(request, { params }) {
  const auth = await authPortal();
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

export async function DELETE(_request, { params }) {
  const auth = await authPortal();
  if (auth.response) return auth.response;

  const { error } = await auth.adminClient
    .from("breeding_animals")
    .delete()
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
