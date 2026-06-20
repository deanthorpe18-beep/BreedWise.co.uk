import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireBreederPortal, buildPortalAccessResponse, getPortalUsage } from "@/lib/breeder-auth";
import { notifyLitterPublished } from "@/lib/litter-alerts";

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
  return { adminClient, breederId: portal.breederId, access: portal.access };
}

export async function GET(_request, { params }) {
  const auth = await authPortal();
  if (auth.response) return auth.response;

  const { data, error } = await auth.adminClient
    .from("breeding_litters")
    .select(`
      *,
      sire:breeding_animals!breeding_litters_sire_id_fkey(id, name, sex),
      dam:breeding_animals!breeding_litters_dam_id_fkey(id, name, sex),
      pups:breeding_litter_animals(*)
    `)
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Litter not found." }, { status: 404 });

  const usage = await getPortalUsage(auth.adminClient, auth.breederId);
  return NextResponse.json({
    litter: data,
    access: buildPortalAccessResponse(auth.access, usage),
  });
}

export async function PATCH(request, { params }) {
  const auth = await authPortal();
  if (auth.response) return auth.response;

  const body = await request.json();
  const updates = { updated_at: new Date().toISOString() };
  const fields = [
    "sire_id", "dam_id", "breed", "animal_type", "litter_name", "birth_date",
    "expected_go_home_date", "total_born", "notes", "status", "is_public", "announcement_text",
  ];

  const { data: before } = await auth.adminClient
    .from("breeding_litters")
    .select("is_public, announced_at")
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .maybeSingle();

  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f];
  }

  if (body.is_public === false) {
    updates.announced_at = null;
  }

  const { data, error } = await auth.adminClient
    .from("breeding_litters")
    .update(updates)
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });

  let alertResult = null;
  if (data.is_public && !before?.is_public && !data.announced_at) {
    alertResult = await notifyLitterPublished(auth.adminClient, data.id);
  }

  return NextResponse.json({ litter: data, alerts: alertResult });
}

export async function DELETE(_request, { params }) {
  const auth = await authPortal();
  if (auth.response) return auth.response;

  const { error } = await auth.adminClient
    .from("breeding_litters")
    .delete()
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
