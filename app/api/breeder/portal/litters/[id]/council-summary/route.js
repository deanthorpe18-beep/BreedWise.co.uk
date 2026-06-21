import { NextResponse } from "next/server";
import { authenticateBreederPortalGold } from "@/lib/breeder-portal-request-auth";
import { saleChecklistProgress } from "@/lib/breeder-portal-sale";

export const dynamic = "force-dynamic";

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export async function GET(request, { params }) {
  const auth = await authenticateBreederPortalGold(request);
  if (auth.response) return auth.response;

  const adminClient = auth.adminClient;

  const { data: litter, error: litterError } = await adminClient
    .from("breeding_litters")
    .select(`
      *,
      sire:breeding_animals!breeding_litters_sire_id_fkey(id, name, sex, microchip, registration_number),
      dam:breeding_animals!breeding_litters_dam_id_fkey(id, name, sex, microchip, registration_number),
      pups:breeding_litter_animals(*)
    `)
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .maybeSingle();

  if (litterError) return NextResponse.json({ error: litterError.message }, { status: 500 });
  if (!litter) return NextResponse.json({ error: "Litter not found." }, { status: 404 });

  const { data: breeder, error: breederError } = await adminClient
    .from("breeders")
    .select("name, council_licence, licence_verified, address, town, county, postcode, phone, email, kennel_club")
    .eq("id", auth.breederId)
    .single();

  if (breederError) return NextResponse.json({ error: breederError.message }, { status: 500 });

  const pups = [...(litter.pups || [])].sort((a, b) => a.sort_order - b.sort_order).map((p) => ({
    ...p,
    checklist: saleChecklistProgress(p),
    go_home_date_display: formatDate(p.go_home_date || litter.expected_go_home_date),
    sold_date_display: formatDate(p.sold_date),
    deposit_date_display: formatDate(p.deposit_date),
    final_payment_date_display: formatDate(p.final_payment_date),
  }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    note: "Generic summary for your records and council. A council-specific form layout can be added when you share your template.",
    breeder: {
      name: breeder.name,
      councilLicence: breeder.council_licence,
      licenceVerified: breeder.licence_verified,
      address: [breeder.address, breeder.town, breeder.county, breeder.postcode].filter(Boolean).join(", "),
      phone: breeder.phone,
      email: breeder.email,
      kennelClub: breeder.kennel_club,
    },
    litter: {
      id: litter.id,
      litterName: litter.litter_name,
      breed: litter.breed,
      animalType: litter.animal_type,
      birthDate: formatDate(litter.birth_date),
      expectedGoHomeDate: formatDate(litter.expected_go_home_date),
      totalBorn: litter.total_born,
      status: litter.status,
      sire: litter.sire,
      dam: litter.dam,
      notes: litter.notes,
    },
    pups,
    totals: {
      onRecord: pups.length,
      sold: pups.filter((p) => p.status === "sold").length,
      reserved: pups.filter((p) => p.status === "reserved").length,
      available: pups.filter((p) => p.status === "available").length,
    },
  });
}
