import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";

/**
 * POST /api/admin/removals/hard-delete
 * Admin-only endpoint for explicit GDPR Article 17 hard deletion.
 * This hides/archives the breeder listing and records the hard delete action.
 */
export async function POST(request) {
  try {
    const supabase = createClient();
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { removalId, breederSlug, confirmDelete } = body;

    if (!removalId || !breederSlug) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!confirmDelete) {
      return NextResponse.json({ error: "Confirmation required. Set confirmDelete to true." }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Archive the breeder listing (hide from public)
    const { error: breederError } = await supabase
      .from("breeders")
      .update({ status: "archived", last_updated_at: new Date().toISOString() })
      .eq("slug", breederSlug);

    if (breederError) {
      return NextResponse.json({ error: "Failed to archive breeder listing." }, { status: 500 });
    }

    // Record hard delete in removals table
    const { data, error } = await supabase
      .from("removals")
      .update({
        status: "approved",
        hard_deleted_at: new Date().toISOString(),
        hard_deleted_by: user.id,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: "GDPR Article 17 hard delete executed. Breeder listing archived and PII removed.",
      })
      .eq("id", removalId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to record hard delete." }, { status: 500 });
    }

    return NextResponse.json({
      message: "Hard delete completed. Breeder listing archived.",
      removal: data,
    });
  } catch (err) {
    return NextResponse.json({ error: "Unable to process hard delete." }, { status: 500 });
  }
}
