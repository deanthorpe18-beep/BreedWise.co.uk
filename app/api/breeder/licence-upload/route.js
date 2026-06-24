import { NextResponse } from "next/server";
import { authenticateBreederAccess } from "@/lib/breeder-request-auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const auth = await authenticateBreederAccess(request);
    if (auth.response) return auth.response;

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

    const { adminClient, breederId } = auth;
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
