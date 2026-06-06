import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendRemovalStatusUpdate } from "@/lib/emails/resend";

async function isAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin";
}

export async function GET() {
  try {
    const supabase = createClient();
    if (!(await isAdmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("removals")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ removals: data });
  } catch (err) {
    return NextResponse.json({ error: "Unable to fetch removals." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const supabase = createClient();
    if (!(await isAdmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, admin_reason, admin_notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("removals")
      .update({
        status,
        admin_reason: admin_reason || null,
        admin_notes: admin_notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        status_update_sent_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Send status update email to requester asynchronously
    if (data?.requester_email) {
      Promise.allSettled([
        sendRemovalStatusUpdate(data.requester_email, data.breeder_name || "your listing", status, admin_reason),
      ]);
    }

    return NextResponse.json({ removal: data });
  } catch (err) {
    return NextResponse.json({ error: "Unable to update removal." }, { status: 500 });
  }
}
