import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getUserBreederId } from "@/lib/breeder-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const breederId = await getUserBreederId(adminClient, user.id, user.email);

    if (!breederId) {
      return NextResponse.json({ error: "No breeder profile found" }, { status: 404 });
    }

    const { data: breeder, error: breederError } = await adminClient
      .from("breeders")
      .select(`
        id, name, slug, about, phone, email, website,
        kennel_club, council_licence, health_testing,
        licence_verified, licence_verification_status,
        status, membership_tier, claimed, availability_status,
        breeder_breeds(breed, animal_type),
        breeder_photos(*)
      `)
      .eq("id", breederId)
      .single();

    if (breederError || !breeder) {
      console.error("[breeder/profile GET] Breeder fetch error:", breederError?.message, breederError?.code);
      return NextResponse.json({ error: "Breeder not found" }, { status: 404 });
    }

    const breedsByAnimal = (breeder.breeder_breeds || []).reduce((acc, bb) => {
      if (!acc[bb.animal_type]) acc[bb.animal_type] = [];
      acc[bb.animal_type].push(bb.breed);
      return acc;
    }, {});

    const photos = (breeder.breeder_photos || []).filter((p) => p.photo_url);

    return NextResponse.json({
      breeder: {
        id: breeder.id,
        name: breeder.name,
        slug: breeder.slug,
        about: breeder.about || "",
        phone: breeder.phone || "",
        email: breeder.email || "",
        website: breeder.website || "",
        kennelClub: breeder.kennel_club || "",
        councilLicence: breeder.council_licence || "",
        licenceVerified: breeder.licence_verified || false,
        licenceVerificationStatus: breeder.licence_verification_status || "none",
        healthTesting: breeder.health_testing || "",
        status: breeder.status,
        membershipTier: breeder.membership_tier,
        availabilityStatus: breeder.availability_status || "available",
        breedsByAnimal,
        photos,
        photoCount: photos.length,
        maxPhotos: breeder.membership_tier === "free" ? 3 : breeder.membership_tier === "bronze" ? 5 : breeder.membership_tier === "silver" ? 10 : 999,
      },
    });
  } catch (err) {
    console.error("[breeder/profile GET] Error:", err?.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();
    const breederId = await getUserBreederId(adminClient, user.id, user.email);

    if (!breederId) {
      return NextResponse.json({ error: "No breeder profile found" }, { status: 404 });
    }

    // Handle breeds update
    if (body.breedsByAnimal !== undefined) {
      if (typeof body.breedsByAnimal !== "object") {
        return NextResponse.json({ error: "breedsByAnimal must be an object" }, { status: 400 });
      }

      const inserts = [];
      for (const [animalType, breeds] of Object.entries(body.breedsByAnimal)) {
        for (const breed of breeds) {
          inserts.push({ breeder_id: breederId, breed, animal_type: animalType });
        }
      }

      await adminClient.from("breeder_breeds").delete().eq("breeder_id", breederId);
      if (inserts.length > 0) {
        const { error: insertError } = await adminClient.from("breeder_breeds").insert(inserts);
        if (insertError) {
          console.error("Error inserting breeds:", insertError);
          return NextResponse.json({ error: "Failed to save breeds" }, { status: 500 });
        }
      }
    }

    // Handle profile fields update
    const allowedFields = ["about", "phone", "email", "website", "kennel_club", "council_licence", "health_testing", "availability_status"];
    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field] || null;
      }
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await adminClient
        .from("breeders")
        .update(updateData)
        .eq("id", breederId);

      if (updateError) {
        console.error("Error updating breeder:", updateError);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[breeder/profile POST] Error:", err?.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
