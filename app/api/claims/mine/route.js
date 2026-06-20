import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: claims, error } = await supabase
      .from("claims")
      .select("id, breeder_name, breeder_slug, status, submitted_at, reviewed_at, admin_reason")
      .eq("claimant_user_id", user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("[claims/mine] DB error:", error.message);
      return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 });
    }

    return NextResponse.json({ claims: claims || [] });
  } catch (err) {
    console.error("[claims/mine] Unexpected error:", err?.message);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
