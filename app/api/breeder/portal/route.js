import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireBreederPortal, getPortalUsage, buildPortalAccessResponse } from "@/lib/breeder-auth";

export const dynamic = "force-dynamic";

async function authPortal() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: "Please log in." }, { status: 401 }) };
  const adminClient = createAdminClient();
  const portal = await requireBreederPortal(adminClient, user.id, user.email);
  if (portal.error) {
    return {
      response: NextResponse.json(
        { error: portal.error, upgradeRequired: portal.upgradeRequired || false },
        { status: portal.status }
      ),
    };
  }
  return { adminClient, ...portal };
}

export async function GET() {
  const auth = await authPortal();
  if (auth.response) return auth.response;

  const { adminClient, breederId, breeder, access } = auth;

  const usage = await getPortalUsage(adminClient, breederId);

  const [
    { data: animals },
    { data: litters },
    { count: pupCount },
  ] = await Promise.all([
    adminClient.from("breeding_animals").select("id, sex, is_active").eq("breeder_id", breederId),
    adminClient.from("breeding_litters").select("id, birth_date, total_born, status").eq("breeder_id", breederId),
    adminClient.from("breeding_litter_animals").select("*", { count: "exact", head: true }).eq("breeder_id", breederId),
  ]);

  const activeAnimals = (animals || []).filter((a) => a.is_active);
  const males = activeAnimals.filter((a) => a.sex === "male").length;
  const females = activeAnimals.filter((a) => a.sex === "female").length;
  const totalLitters = (litters || []).length;
  const pupsBorn = (litters || []).reduce((sum, l) => sum + (l.total_born || 0), 0);

  return NextResponse.json({
    breeder: {
      name: breeder.name,
      slug: breeder.slug,
      licenceVerified: breeder.licence_verified,
      membershipTier: breeder.membership_tier,
    },
    access: buildPortalAccessResponse(access, usage),
    stats: {
      breedingAnimals: activeAnimals.length,
      males,
      females,
      totalLitters,
      pupsBorn,
      pupsOnRecord: pupCount || 0,
    },
  });
}
