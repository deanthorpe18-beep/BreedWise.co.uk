import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminClient();

  // Try the official breeds table first (bypasses RLS with admin client)
  const { data: officialBreeds, error } = await supabase
    .from("breeds")
    .select("name")
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
