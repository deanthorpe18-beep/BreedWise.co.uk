import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createAdminClient();

  const [
    { count: animalCount },
    { count: litterCount },
    { count: pupCount },
    { count: waitlistCount },
    { count: publicLitterCount },
    { data: litters },
    { data: waitlistRows },
  ] = await Promise.all([
    adminClient.from("breeding_animals").select("*", { count: "exact", head: true }).eq("is_active", true),
    adminClient.from("breeding_litters").select("*", { count: "exact", head: true }),
    adminClient.from("breeding_litter_animals").select("*", { count: "exact", head: true }),
    adminClient.from("breeder_waitlist").select("*", { count: "exact", head: true }).neq("status", "withdrawn"),
    adminClient.from("breeding_litters").select("*", { count: "exact", head: true }).eq("is_public", true),
    adminClient
      .from("breeding_litters")
      .select(
        `
        id, breed, litter_name, birth_date, status, is_public, announced_at, created_at, total_born,
        breeder:breeders(id, name, slug, town, county, membership_tier)
      `
      )
      .order("created_at", { ascending: false })
      .limit(40),
    adminClient.from("breeder_waitlist").select("breeder_id").neq("status", "withdrawn"),
  ]);

  const waitlistByBreeder = (waitlistRows || []).reduce((acc, row) => {
    acc[row.breeder_id] = (acc[row.breeder_id] || 0) + 1;
    return acc;
  }, {});

  const breederIds = new Set([
    ...(litters || []).map((l) => l.breeder?.id).filter(Boolean),
    ...Object.keys(waitlistByBreeder),
  ]);

  let breeders = [];
  if (breederIds.size > 0) {
    const ids = [...breederIds];
    const [{ data: breederRows }, { data: animalRows }, { data: litterRows }] = await Promise.all([
      adminClient
        .from("breeders")
        .select("id, name, slug, town, county, membership_tier, council_licence, status")
        .in("id", ids)
        .order("name"),
      adminClient.from("breeding_animals").select("breeder_id").eq("is_active", true).in("breeder_id", ids),
      adminClient.from("breeding_litters").select("breeder_id").in("breeder_id", ids),
    ]);

    const animalsByBreeder = (animalRows || []).reduce((acc, row) => {
      acc[row.breeder_id] = (acc[row.breeder_id] || 0) + 1;
      return acc;
    }, {});
    const littersByBreeder = (litterRows || []).reduce((acc, row) => {
      acc[row.breeder_id] = (acc[row.breeder_id] || 0) + 1;
      return acc;
    }, {});

    breeders = (breederRows || []).map((b) => ({
      ...b,
      animalCount: animalsByBreeder[b.id] || 0,
      litterCount: littersByBreeder[b.id] || 0,
      waitlistCount: waitlistByBreeder[b.id] || 0,
    }));
  }

  const activeBreederIds = new Set(breeders.map((b) => b.id));

  return NextResponse.json({
    summary: {
      activeBreederCount: activeBreederIds.size,
      animalCount: animalCount || 0,
      litterCount: litterCount || 0,
      pupCount: pupCount || 0,
      waitlistCount: waitlistCount || 0,
      publicLitterCount: publicLitterCount || 0,
    },
    breeders,
    litters: (litters || []).map((l) => ({
      id: l.id,
      breed: l.breed,
      litterName: l.litter_name,
      birthDate: l.birth_date,
      status: l.status,
      isPublic: l.is_public,
      announcedAt: l.announced_at,
      totalBorn: l.total_born,
      createdAt: l.created_at,
      breeder: l.breeder,
    })),
  });
}
