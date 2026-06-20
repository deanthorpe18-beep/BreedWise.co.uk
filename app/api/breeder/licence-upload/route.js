import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getBreederId(adminClient, userId, userEmail) {
  const { data: sub } = await adminClient
    .from("breeder_subscriptions")
    .select("breeder_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (sub?.breeder_id) return sub.breeder_id;

  const { data: claim } = await adminClient
    .from("claims")
    .select("breeder_slug")
    .eq("claimant_user_id", userId)
    .eq("status", "approved")
    .order("reviewed_at", { ascending: false })
    .maybeSingle();
  if (claim?.breeder_slug) {
    const { data: b } = await adminClient.from("breeders").select("id").eq("slug", claim.breeder_slug).maybeSingle();
    if (b) return b.id;
  }

  if (userEmail) {
    const { data: b } = await adminClient
      .from("breeders")
      .select("id")
      .eq("email", userEmail)
      .eq("status", "claimed_profile")
      .maybeSingle();
    if (b) return b.id;
  }
  return null;
}

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const licenceNumber = formData.get("licence_number");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF, JPG, PNG allowed." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const breederId = await getBreederId(adminClient, user.id, user.email);
    if (!breederId) {
      return NextResponse.json({ error: "No claimed breeder profile found" }, { status: 404 });
    }

    const ext = file.name.split(".").pop().toLowerCase();
    const filePath = `licence-verification/${breederId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await adminClient.storage
      .from("claim-evidence")
      .upload(filePath, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const updates = {
      licence_document_path: filePath,
      licence_verification_status: "pending",
      licence_verified: false,
      updated_at: new Date().toISOString(),
    };
    if (licenceNumber && String(licenceNumber).trim()) {
      updates.council_licence = String(licenceNumber).trim();
    }

    const { error: updateError } = await adminClient
      .from("breeders")
      .update(updates)
      .eq("id", breederId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: "pending" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
