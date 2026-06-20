import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("breeds")
      .select("id, name, slug, animal_type, image_url, image_reviewed")
      .order("animal_type", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ breeds: data || [] });
  } catch (err) {
    console.error("[breed-images] Error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Unable to fetch breed images." },
      { status: 500 }
    );
  }
}
