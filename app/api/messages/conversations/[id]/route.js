import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a participant
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .or(`buyer_id.eq.${user.id},breeder_user_id.eq.${user.id}`)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    // Update unread counts for current user
    const isBuyer = conversation.buyer_id === user.id;
    const isBreeder = conversation.breeder_user_id === user.id;

    const updates = {};
    if (isBuyer) {
      updates.buyer_unread_count = 0;
    } else if (isBreeder) {
      updates.breeder_unread_count = 0;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from("conversations").update(updates).eq("id", id);
    }

    // Mark other party's messages as read
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", id)
      .neq("sender_id", user.id)
      .is("read_at", null);

    return NextResponse.json({ conversation, messages: messages || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a participant
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .or(`buyer_id.eq.${user.id},breeder_user_id.eq.${user.id}`)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Reset unread count for current user
    const isBuyer = conversation.buyer_id === user.id;
    const isBreeder = conversation.breeder_user_id === user.id;

    const updates = {};
    if (isBuyer) {
      updates.buyer_unread_count = 0;
    } else if (isBreeder) {
      updates.breeder_unread_count = 0;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from("conversations").update(updates).eq("id", id);
    }

    // Mark other party's messages as read
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", id)
      .neq("sender_id", user.id)
      .is("read_at", null);

    return NextResponse.json({ message: "Marked as read" });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
