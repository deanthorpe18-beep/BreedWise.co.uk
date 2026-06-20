import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireBreederPortal } from "@/lib/breeder-auth";

export const dynamic = "force-dynamic";

function addWeeks(dateStr, weeks) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split("T")[0];
}

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

  const { data: litters, error } = await auth.adminClient
    .from("breeding_litters")
    .select(`
      *,
      sire:breeding_animals!breeding_litters_sire_id_fkey(id, name, sex),
      dam:breeding_animals!breeding_litters_dam_id_fkey(id, name, sex),
      pups:breeding_litter_animals(id, name, sex, status, colour)
    `)
    .eq("breeder_id", auth.breederId)
    .order("birth_date", { ascending: false, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ litters: litters || [] });
}

export async function POST(request) {
  const auth = await authPortal();
  if (auth.response) return auth.response;

  const body = await request.json();
  const breed = (body.breed || "").trim();
  if (!breed) return NextResponse.json({ error: "Breed is required." }, { status: 400 });

  const birthDate = body.birth_date || null;
  const animalType = body.animal_type || "dog";
  const goHomeWeeks = animalType === "cat" ? 13 : 8;

  const row = {
    breeder_id: auth.breederId,
    sire_id: body.sire_id || null,
    dam_id: body.dam_id || null,
    animal_type: animalType,
    breed,
    litter_name: body.litter_name?.trim() || null,
    birth_date: birthDate,
    expected_go_home_date: body.expected_go_home_date || addWeeks(birthDate, goHomeWeeks),
    total_born: body.total_born != null ? Number(body.total_born) : null,
    notes: body.notes?.trim() || null,
    status: body.status || (birthDate ? "active" : "planned"),
    updated_at: new Date().toISOString(),
  };

  const { data: litter, error } = await auth.adminClient.from("breeding_litters").insert(row).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pupCount = Math.max(0, Number(body.total_born) || 0);
  if (pupCount > 0 && pupCount <= 20) {
    const pups = Array.from({ length: pupCount }, (_, i) => ({
      litter_id: litter.id,
      breeder_id: auth.breederId,
      name: `${breed} ${i + 1}`,
      sex: "unknown",
      status: "available",
      sort_order: i,
    }));
    await auth.adminClient.from("breeding_litter_animals").insert(pups);
  }

  return NextResponse.json({ litter });
}
