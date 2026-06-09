import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { conversation_id, content } = body;

    if (!conversation_id || !content?.trim()) {
      return NextResponse.json(
        { error: "conversation_id and content are required" },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversation_id)
      .or(`buyer_id.eq.${user.id},breeder_user_id.eq.${user.id}`)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Determine sender type
    let senderType;
    if (conversation.buyer_id === user.id) {
      senderType = "buyer";
    } else if (conversation.breeder_user_id === user.id) {
      senderType = "breeder";
    } else {
      return NextResponse.json(
        { error: "You are not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Insert message
    const { data: message, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        sender_id: user.id,
        sender_type: senderType,
        content: content.trim(),
      })
      .select()
      .single();

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    // Update conversation timestamps and unread count for the other party
    const unreadField =
      senderType === "buyer" ? "breeder_unread_count" : "buyer_unread_count";
    const currentUnread =
      senderType === "buyer"
        ? conversation.breeder_unread_count || 0
        : conversation.buyer_unread_count || 0;

    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        [unreadField]: currentUnread + 1,
      })
      .eq("id", conversation_id);

    if (updateError) {
      // Log but don't fail the request — the message was sent successfully
      console.error("Failed to update conversation:", updateError);
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
