import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireBreederPortal } from "@/lib/breeder-auth";

export const dynamic = "force-dynamic";

async function authPortal() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: "Please log in." }, { status: 401 }) };
  const adminClient = createAdminClient();
  const portal = await requireBreederPortal(adminClient, user.id, user.email);
  if (portal.error) {
    return { response: NextResponse.json({ error: portal.error }, { status: portal.status }) };
  }
  return { adminClient, breederId: portal.breederId };
}

export async function GET() {
  const auth = await authPortal();
  if (auth.response) return auth.response;

  const { data, error } = await auth.adminClient
    .from("breeder_waitlist")
    .select("*")
    .eq("breeder_id", auth.breederId)
    .neq("status", "withdrawn")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const waiting = (data || []).filter((e) => e.status === "waiting").length;
  return NextResponse.json({ entries: data || [], waitingCount: waiting });
}

export async function PATCH(request) {
  const auth = await authPortal();
  if (auth.response) return auth.response;

  const body = await request.json();
  const { id, status } = body;
  if (!id || !status) {
    return NextResponse.json({ error: "id and status required." }, { status: 400 });
  }

  const allowed = ["waiting", "contacted", "fulfilled", "withdrawn"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { data, error } = await auth.adminClient
    .from("breeder_waitlist")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("breeder_id", auth.breederId)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ entry: data });
}
