import { NextResponse } from "next/server";
import {
  getPortalUsage,
  checkPortalLimit,
  buildPortalAccessResponse,
} from "@/lib/breeder-auth";
import { authenticateBreederPortal } from "@/lib/breeder-portal-request-auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await authenticateBreederPortal(request);
  if (auth.response) return auth.response;

  const usage = await getPortalUsage(auth.adminClient, auth.breederId);

  const { data, error } = await auth.adminClient
    .from("breeding_animals")
    .select("*")
    .eq("breeder_id", auth.breederId)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    animals: data || [],
    access: buildPortalAccessResponse(auth.access, usage),
  });
}

export async function POST(request) {
  const auth = await authenticateBreederPortal(request);
  if (auth.response) return auth.response;

  const usage = await getPortalUsage(auth.adminClient, auth.breederId);
  const limit = checkPortalLimit(auth.access, usage, "animals");
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.message, upgradeRequired: auth.access.tier === "silver" }, { status: 403 });
  }

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
