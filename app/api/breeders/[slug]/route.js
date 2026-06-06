import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { slug } = await params;
        const supabase = createClient();

        const { data: breeder, error } = await supabase
            .from("breeders")
            .select("*, breeder_breeds(breed), breeder_photos(*)")
            .eq("slug", slug)
            .in("status", ["public_listing", "claimed_profile"])
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json({ error: "Breeder not found" }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform nested arrays
        const result = {
            ...breeder,
            breeds: breeder.breeder_breeds?.map((bb) => bb.breed) || [],
            photos: breeder.breeder_photos || [],
            breeder_breeds: undefined,
            breeder_photos: undefined,
        };

        return NextResponse.json({ breeder: result });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
