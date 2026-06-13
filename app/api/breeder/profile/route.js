import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Find breeder owned by this user
    const { data: subscription } = await adminClient
      .from("breeder_subscriptions")
      .select("breeder_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!subscription) {
      return NextResponse.json({ error: "No breeder profile found" }, { status: 404 });
    }

    const { data: breeder } = await adminClient
      .from("breeders")
      .select("id, name, slug, breeder_breeds(breed, animal_type)")
      .eq("id", subscription.breeder_id)
      .single();

    if (!breeder) {
      return NextResponse.json({ error: "Breeder not found" }, { status: 404 });
    }

    // Group breeds by animal type
    const breedsByAnimal = (breeder.breeder_breeds || []).reduce((acc, bb) => {
      if (!acc[bb.animal_type]) acc[bb.animal_type] = [];
      acc[bb.animal_type].push(bb.breed);
      return acc;
    }, {});

    return NextResponse.json({
      breeder: {
        id: breeder.id,
        name: breeder.name,
        slug: breeder.slug,
        breedsByAnimal,
      },
    });
  } catch (err) {
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
    const { breedsByAnimal } = body;

    if (!breedsByAnimal || typeof breedsByAnimal !== "object") {
      return NextResponse.json({ error: "breedsByAnimal is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Find breeder owned by this user
    const { data: subscription } = await adminClient
      .from("breeder_subscriptions")
      .select("breeder_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!subscription) {
      return NextResponse.json({ error: "No breeder profile found" }, { status: 404 });
    }

    const breederId = subscription.breeder_id;

    // Build new breed inserts
    const inserts = [];
    for (const [animalType, breeds] of Object.entries(breedsByAnimal)) {
      for (const breed of breeds) {
        inserts.push({
          breeder_id: breederId,
          breed,
          animal_type: animalType,
        });
      }
    }

    // Delete existing breeds and insert new ones in a transaction
    const { error: deleteError } = await adminClient
      .from("breeder_breeds")
      .delete()
      .eq("breeder_id", breederId);

    if (deleteError) {
      console.error("Error deleting breeds:", deleteError);
      return NextResponse.json({ error: "Failed to update breeds" }, { status: 500 });
    }

    if (inserts.length > 0) {
      const { error: insertError } = await adminClient
        .from("breeder_breeds")
        .insert(inserts);

      if (insertError) {
        console.error("Error inserting breeds:", insertError);
        return NextResponse.json({ error: "Failed to save breeds" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
