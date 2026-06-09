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
            .from("recent_searches")
            .select("*")
            .eq("user_id", user.id)
            .order("searched_at", { ascending: false })
            .limit(20);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ recent_searches: data });
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
        const { query, breed, max_distance, user_lat, user_lng, result_count } = body;

        const { data, error } = await supabase
            .from("recent_searches")
            .insert({
                user_id: user.id,
                query: query || null,
                breed: breed || null,
                max_distance: max_distance || null,
                user_lat: user_lat || null,
                user_lng: user_lng || null,
                result_count: result_count || null,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Keep only the last 20 recent searches for this user
        const { data: toDelete } = await supabase
            .from("recent_searches")
            .select("id")
            .eq("user_id", user.id)
            .order("searched_at", { ascending: false })
            .range(20, 99999);

        if (toDelete?.length) {
            await supabase
                .from("recent_searches")
                .delete()
                .in(
                    "id",
                    toDelete.map((r) => r.id)
                );
        }

        return NextResponse.json({ recent_search: data }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = await supabase
            .from("recent_searches")
            .delete()
            .eq("user_id", user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
