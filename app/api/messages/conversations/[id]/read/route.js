import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a participant
    const { data: conversation } = await supabase
      .from("conversations")
      .select("buyer_id, breeder_user_id, buyer_unread_count, breeder_unread_count")
      .eq("id", id)
      .or(`buyer_id.eq.${user.id},breeder_user_id.eq.${user.id}`)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isBuyer = conversation.buyer_id === user.id;

    // Mark messages from the other party as read
    const { error: msgError } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", id)
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (msgError) {
      console.error("[messages/read] Update error:", msgError.message);
    }

    // Reset unread count for this user
    const updates = {};
    if (isBuyer) updates.buyer_unread_count = 0;
    else updates.breeder_unread_count = 0;

    const { error: updErr } = await supabase.from("conversations").update(updates).eq("id", id);
    if (updErr) {
      console.error("[messages/read] Conversation update error:", updErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[messages/read] Unexpected error:", err?.message);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
