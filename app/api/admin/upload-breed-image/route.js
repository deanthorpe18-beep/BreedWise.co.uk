import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const breedId = formData.get("breedId");
    const breedSlug = formData.get("breedSlug") || breedId;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!breedId) {
      return NextResponse.json({ error: "No breed ID provided" }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP allowed." }, { status: 400 });
    }

    const ext = file.name.split(".").pop().toLowerCase();
    const safeSlug = String(breedSlug).replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const fileName = `${safeSlug}-${Date.now()}.${ext}`;

    const adminClient = createAdminClient();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from("breed-images")
      .upload(fileName, file, { contentType: file.type });

    if (uploadError) {
      console.error("[upload-breed-image] Storage error:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from("breed-images")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Update breed record
    const { error: updateError } = await adminClient
      .from("breeds")
      .update({ image_url: publicUrl })
      .eq("id", breedId);

    if (updateError) {
      console.error("[upload-breed-image] DB update error:", updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl, path: fileName });
  } catch (err) {
    console.error("[upload-breed-image] Unexpected error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Upload failed." },
      { status: 500 }
    );
  }
}
