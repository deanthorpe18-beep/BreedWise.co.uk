import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("saved_breeders")
            .select(`
                id,
                breeder_id,
                saved_at,
                notes,
                breeders (
                    id,
                    slug,
                    name,
                    town,
                    county,
                    postcode,
                    lat,
                    lng,
                    google_rating,
                    phone,
                    email,
                    website,
                    hero_image_url
                )
            `)
            .eq("user_id", user.id)
            .order("saved_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ saved: data, saved_breeders: data });
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
        const { breeder_id, notes } = body;

        if (!breeder_id) {
            return NextResponse.json({ error: "breeder_id is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("saved_breeders")
            .insert({
                user_id: user.id,
                breeder_id,
                notes: notes || null,
            })
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json({ error: "Breeder already saved" }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ saved_breeder: data }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, breeder_id } = body;

        if (!id && !breeder_id) {
            return NextResponse.json({ error: "id or breeder_id is required" }, { status: 400 });
        }

        let query = supabase.from("saved_breeders").delete().eq("user_id", user.id);

        if (id) {
            query = query.eq("id", id);
        } else {
            query = query.eq("breeder_id", breeder_id);
        }

        const { error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
