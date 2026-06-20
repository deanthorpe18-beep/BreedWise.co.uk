import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendNewMessageEmail } from "@/lib/emails/resend";

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

    // Notify recipient asynchronously (fire-and-forget)
    try {
      const adminClient = createAdminClient();
      const recipientId = senderType === "buyer" ? conversation.breeder_user_id : conversation.buyer_id;
      if (recipientId) {
        const { data: recipient } = await adminClient.auth.admin.getUserById(recipientId);
        const recipientEmail = recipient?.user?.email;
        if (recipientEmail) {
          const senderName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email || "Someone";
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://breedwise.co.uk";
          const conversationUrl = `${siteUrl}/messages/${conversation_id}`;
          sendNewMessageEmail(recipientEmail, senderName, conversationUrl, content.trim()).catch((err) => {
            console.error("[messages] Notification email failed:", err?.message || err);
          });
        }
      }
    } catch (notifyErr) {
      console.error("[messages] Notification error:", notifyErr?.message || notifyErr);
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
