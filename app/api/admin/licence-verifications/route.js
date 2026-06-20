import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("breeders")
      .select("id, slug, name, town, county, council_licence, licence_document_path, licence_verification_status, licence_verified, email")
      .eq("licence_verification_status", "pending")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const withUrls = await Promise.all(
      (data || []).map(async (b) => {
        let documentUrl = null;
        if (b.licence_document_path) {
          const { data: signed } = await admin.storage
            .from("claim-evidence")
            .createSignedUrl(b.licence_document_path, 3600);
          documentUrl = signed?.signedUrl || null;
        }
        return { ...b, documentUrl };
      })
    );

    return NextResponse.json({ pending: withUrls, count: withUrls.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { breederId, action, reason } = await request.json();
    if (!breederId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "breederId and action (approve|reject) required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const updates =
      action === "approve"
        ? { licence_verified: true, licence_verification_status: "approved" }
        : { licence_verified: false, licence_verification_status: "rejected" };

    const { data, error } = await admin
      .from("breeders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", breederId)
      .select("id, slug, name, licence_verified, licence_verification_status")
      .single();

    if (error) throw error;

    return NextResponse.json({ breeder: data, reason: reason || null });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
