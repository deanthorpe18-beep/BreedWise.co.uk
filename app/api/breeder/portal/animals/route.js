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

export async function GET() {
  const auth = await authPortal();
  if (auth.response) return auth.response;

  const { data, error } = await auth.adminClient
    .from("breeding_animals")
    .select("*")
    .eq("breeder_id", auth.breederId)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ animals: data || [] });
}

export async function POST(request) {
  const auth = await authPortal();
  if (auth.response) return auth.response;

  const body = await request.json();
  const name = (body.name || "").trim();
  const breed = (body.breed || "").trim();
  if (!name || !breed) {
    return NextResponse.json({ error: "Name and breed are required." }, { status: 400 });
  }

  const row = {
    breeder_id: auth.breederId,
    name,
    breed,
    animal_type: body.animal_type || "dog",
    sex: body.sex === "male" || body.sex === "female" ? body.sex : null,
    date_of_birth: body.date_of_birth || null,
    microchip: body.microchip?.trim() || null,
    registration_number: body.registration_number?.trim() || null,
    colour: body.colour?.trim() || null,
    notes: body.notes?.trim() || null,
    is_active: body.is_active !== false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await auth.adminClient.from("breeding_animals").insert(row).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ animal: data });
}
