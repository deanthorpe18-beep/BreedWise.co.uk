import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Helper: find breeder ID for current user via subscription or approved claim
async function getUserBreederId(adminClient, userId) {
  const { data: subscription } = await adminClient
    .from("breeder_subscriptions")
    .select("breeder_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (subscription?.breeder_id) {
    return subscription.breeder_id;
  }

  const { data: claim } = await adminClient
    .from("claims")
    .select("breeder_slug")
    .eq("claimant_user_id", userId)
    .eq("status", "approved")
    .order("reviewed_at", { ascending: false })
    .maybeSingle();

  if (claim?.breeder_slug) {
    const { data: breeder } = await adminClient
      .from("breeders")
      .select("id")
      .eq("slug", claim.breeder_slug)
      .single();
    return breeder?.id || null;
  }

  return null;
}

function getMaxPhotos(tier) {
  switch (tier) {
    case "free": return 3;
    case "bronze": return 5;
    case "silver": return 10;
    case "gold": return 999;
    default: return 3;
  }
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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

    const adminClient = createAdminClient();
    const breederId = await getUserBreederId(adminClient, user.id);

    if (!breederId) {
      return NextResponse.json({ error: "No breeder profile found" }, { status: 404 });
    }

    // Check current photo count and tier
    const { data: breeder } = await adminClient
      .from("breeders")
      .select("membership_tier")
      .eq("id", breederId)
      .single();

    const maxPhotos = getMaxPhotos(breeder?.membership_tier);

    const { count: photoCount } = await adminClient
      .from("breeder_photos")
      .select("id", { count: "exact", head: true })
      .eq("breeder_id", breederId);

    if (photoCount >= maxPhotos) {
      return NextResponse.json(
        { error: `Photo limit reached. Free tier allows ${maxPhotos} photos. Upgrade to add more.` },
        { status: 403 }
      );
    }

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop().toLowerCase();
    const fileName = `${breederId}/${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from("breeder-photos")
      .upload(fileName, file, { contentType: file.type });

    if (uploadError) {
      console.error("[breeder/photos] Storage error:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from("breeder-photos")
      .getPublicUrl(fileName);

    // Insert into breeder_photos
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

    return NextResponse.json({ photo: photoRow, remaining: maxPhotos - photoCount - 1 });
  } catch (err) {
    console.error("[breeder/photos] Unexpected error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Upload failed." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const breederId = await getUserBreederId(adminClient, user.id);

    if (!breederId) {
      return NextResponse.json({ error: "No breeder profile found" }, { status: 404 });
    }

    // Verify the photo belongs to this breeder
    const { data: photo } = await adminClient
      .from("breeder_photos")
      .select("id, photo_reference")
      .eq("id", photoId)
      .eq("breeder_id", breederId)
      .single();

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete from storage
    if (photo.photo_reference) {
      await adminClient.storage.from("breeder-photos").remove([photo.photo_reference]);
    }

    // Delete from DB
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
