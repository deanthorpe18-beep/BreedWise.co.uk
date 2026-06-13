import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const animal = searchParams.get("animal") || "";
  const supabase = createAdminClient();

  // If animal type specified, return breeds for that type
  if (animal) {
    const { data, error } = await supabase
      .from("breeds")
      .select("name, slug, animal_type")
      .eq("animal_type", animal)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      breeds: (data || []).map((b) => b.name),
      animal,
      count: data?.length || 0,
    });
  }

  // No animal specified — return all breeds grouped by type (legacy behaviour)
  const { data: officialBreeds, error } = await supabase
    .from("breeds")
    .select("name, animal_type")
    .order("name", { ascending: true });

  if (!error && officialBreeds && officialBreeds.length > 0) {
    return NextResponse.json({
      breeds: officialBreeds.map((b) => b.name),
      source: "official",
      count: officialBreeds.length,
    });
  }

  // Fallback to breeder_breeds (dynamic from listings)
  const { data, error: fallbackError } = await supabase
    .from("breeder_breeds")
    .select("breed")
    .order("breed", { ascending: true });

  if (fallbackError) {
    return NextResponse.json({ error: fallbackError.message }, { status: 500 });
  }

  const breeds = [...new Set((data || []).map((b) => b.breed))].sort();
  return NextResponse.json({ breeds, source: "dynamic", count: breeds.length });
}
