import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { slug } = await params;
        const supabase = createClient();

        const { data: breeder, error } = await supabase
            .from("breeders")
            .select("*, breeder_breeds(breed, animal_type), breeder_photos(*)")
            .eq("slug", slug)
            .in("status", ["public_listing", "claimed_profile"])
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json({ error: "Breeder not found" }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Group breeds by animal_type
        const breedsByAnimal = (breeder.breeder_breeds || []).reduce((acc, bb) => {
            if (!acc[bb.animal_type]) acc[bb.animal_type] = [];
            acc[bb.animal_type].push(bb.breed);
            return acc;
        }, {});

        const allBreeds = breeder.breeder_breeds?.map((bb) => bb.breed) || [];

        // Transform nested arrays
        const result = {
            ...breeder,
            breeds: allBreeds,
            breedsByAnimal,
            photos: breeder.breeder_photos || [],
            breeder_breeds: undefined,
            breeder_photos: undefined,
        };

        return NextResponse.json({ breeder: result });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
