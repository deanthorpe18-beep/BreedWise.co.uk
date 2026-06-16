import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Find breeder ID for current user via multiple methods
async function getUserBreederId(adminClient, userId, userEmail) {
  // Method 1: breeder_subscriptions table
  const { data: subscription } = await adminClient
    .from("breeder_subscriptions")
    .select("breeder_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (subscription?.breeder_id) {
    return subscription.breeder_id;
  }

  // Method 2: approved claims by user ID
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
      .maybeSingle();
    if (breeder?.id) return breeder.id;
  }

  // Method 3: match by email on claimed breeders
  if (userEmail) {
    const { data: breederByEmail } = await adminClient
      .from("breeders")
      .select("id")
      .eq("email", userEmail)
      .eq("status", "claimed_profile")
      .maybeSingle();

    if (breederByEmail?.id) {
      // Auto-create subscription so this works next time
      await adminClient
        .from("breeder_subscriptions")
        .upsert({
          breeder_id: breederByEmail.id,
          user_id: userId,
          tier: "free",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "breeder_id" });
      return breederByEmail.id;
    }
  }

  // Method 4: match by email in claims table
  if (userEmail) {
    const { data: claimByEmail } = await adminClient
      .from("claims")
      .select("breeder_slug")
      .eq("claimant_email", userEmail)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .maybeSingle();

    if (claimByEmail?.breeder_slug) {
      const { data: breeder } = await adminClient
        .from("breeders")
        .select("id")
        .eq("slug", claimByEmail.breeder_slug)
        .maybeSingle();
      if (breeder?.id) return breeder.id;
    }
  }

  return null;
}

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

    const { data: breeder } = await adminClient
      .from("breeders")
      .select(`
        id, name, slug, about, phone, email, website,
        kennel_club, council_licence, health_testing,
        status, membership_tier, claimed,
        breeder_breeds(breed, animal_type),
        breeder_photos(*)
      `)
      .eq("id", breederId)
      .single();

    if (!breeder) {
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
        healthTesting: breeder.health_testing || "",
        status: breeder.status,
        membershipTier: breeder.membership_tier,
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
    const allowedFields = ["about", "phone", "email", "website", "kennel_club", "council_licence", "health_testing"];
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
