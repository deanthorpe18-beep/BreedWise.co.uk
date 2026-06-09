import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*, breeder:breeders(id, name, slug, town)")
      .or(`buyer_id.eq.${user.id},breeder_user_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversations: conversations || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { breeder_id, subject } = body;

    if (!breeder_id) {
      return NextResponse.json(
        { error: "breeder_id is required" },
        { status: 400 }
      );
    }

    // Verify breeder exists
    const { data: breeder, error: breederError } = await supabase
      .from("breeders")
      .select("slug")
      .eq("id", breeder_id)
      .single();

    if (breederError || !breeder) {
      return NextResponse.json({ error: "Breeder not found" }, { status: 404 });
    }

    // Look up approved claim to get breeder_user_id (bypass RLS with admin client)
    const adminClient = createAdminClient();
    const { data: claim } = await adminClient
      .from("claims")
      .select("claimant_user_id")
      .eq("breeder_slug", breeder.slug)
      .eq("status", "approved")
      .maybeSingle();

    const breederUserId = claim?.claimant_user_id || null;

    // Prevent messaging yourself
    if (breederUserId && breederUserId === user.id) {
      return NextResponse.json(
        { error: "You cannot start a conversation with yourself" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        buyer_id: user.id,
        breeder_id,
        breeder_user_id: breederUserId,
        subject: subject || null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Conversation already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversation: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
