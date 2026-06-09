import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request, { params }) {
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

    const body = await request.json();
    const { reason } = body;

    if (!reason?.trim()) {
      return NextResponse.json(
        { error: "reason is required" },
        { status: 400 }
      );
    }

    // Verify message exists
    const { data: message, error: msgError } = await supabase
      .from("messages")
      .select("conversation_id")
      .eq("id", id)
      .single();

    if (msgError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Verify user is a participant in the conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", message.conversation_id)
      .or(`buyer_id.eq.${user.id},breeder_user_id.eq.${user.id}`)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "You are not a participant in this conversation" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .update({
        report_reason: reason.trim(),
        reported_at: new Date().toISOString(),
        reported_by: user.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: data });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
