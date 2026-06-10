import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();

  // Try the official breeds table first
  try {
    const { data: officialBreeds, error } = await supabase
      .from("breeds")
      .select("name")
      .order("name", { ascending: true });

    if (!error && officialBreeds && officialBreeds.length > 0) {
      return NextResponse.json({
        breeds: officialBreeds.map((b) => b.name),
        source: "official",
      });
    }
  } catch {
    // Table may not exist yet — fall through
  }

  // Fallback to breeder_breeds (dynamic from listings)
  try {
    const { data, error: fallbackError } = await supabase
      .from("breeder_breeds")
      .select("breed")
      .order("breed", { ascending: true });

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    }

    const breeds = [...new Set((data || []).map((b) => b.breed))].sort();
    return NextResponse.json({ breeds, source: "dynamic" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
