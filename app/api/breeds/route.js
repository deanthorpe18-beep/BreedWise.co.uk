import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("breeder_breeds")
            .select("breed")
            .order("breed", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const breeds = [...new Set(data?.map((b) => b.breed) || [])];
        return NextResponse.json({ breeds });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
