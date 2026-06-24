import { NextResponse } from "next/server";
import { authenticateBreederAccess } from "@/lib/breeder-request-auth";
import { getPhotoLimit } from "@/lib/tiers";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const auth = await authenticateBreederAccess(request);
    if (auth.response) return auth.response;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP allowed." }, { status: 400 });
    }

    const { adminClient, user, breederId } = auth;

    const { data: breeder } = await adminClient
      .from("breeders")
      .select("membership_tier")
      .eq("id", breederId)
      .single();

    const maxPhotos = getPhotoLimit(breeder?.membership_tier || "free");
    const effectiveMax = maxPhotos === Infinity ? 999 : maxPhotos;

    const { count: photoCount } = await adminClient
      .from("breeder_photos")
      .select("id", { count: "exact", head: true })
      .eq("breeder_id", breederId);

    if (photoCount >= effectiveMax) {
      return NextResponse.json(
        { error: `Photo limit reached (${effectiveMax} max for your plan). Upgrade to add more.` },
        { status: 403 }
      );
    }

    const ext = file.name.split(".").pop().toLowerCase();
    const fileName = `${breederId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await adminClient.storage
      .from("breeder-photos")
      .upload(fileName, file, { contentType: file.type });

    if (uploadError) {
      console.error("[breeder/photos] Storage error:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = adminClient.storage.from("breeder-photos").getPublicUrl(fileName);

    const { data: photoRow, error: dbError } = await adminClient
      .from("breeder_photos")
      .insert({
        breeder_id: breederId,
        photo_reference: fileName,
        photo_url: urlData.publicUrl,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("[breeder/photos] DB error:", dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ photo: photoRow, remaining: effectiveMax - photoCount - 1 });
  } catch (err) {
    console.error("[breeder/photos] Unexpected error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Upload failed." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await authenticateBreederAccess(request);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    const { adminClient, breederId } = auth;

    const { data: photo } = await adminClient
      .from("breeder_photos")
      .select("id, photo_reference")
      .eq("id", photoId)
      .eq("breeder_id", breederId)
      .single();

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (photo.photo_reference) {
      await adminClient.storage.from("breeder-photos").remove([photo.photo_reference]);
    }

    const { error: deleteError } = await adminClient
      .from("breeder_photos")
      .delete()
      .eq("id", photoId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
