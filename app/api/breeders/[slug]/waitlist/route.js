import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendWaitlistWelcome } from "@/lib/litter-alerts";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const name = (body.name || "").trim();
    const phone = (body.phone || "").trim();
    const breedInterest = (body.breed_interest || "").trim();
    const message = (body.message || "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: breeder } = await adminClient
      .from("breeders")
      .select("id, slug, name, status")
      .eq("slug", params.slug)
      .in("status", ["public_listing", "claimed_profile"])
      .maybeSingle();

    if (!breeder) {
      return NextResponse.json({ error: "Breeder not found." }, { status: 404 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const row = {
      breeder_id: breeder.id,
      user_id: user?.id || null,
      email,
      name: name || null,
      phone: phone || null,
      breed_interest: breedInterest || null,
      message: message || null,
      status: "waiting",
      notify_new_litters: true,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await adminClient
      .from("breeder_waitlist")
      .select("id, status")
      .eq("breeder_id", breeder.id)
      .ilike("email", email)
      .maybeSingle();

    if (existing) {
      if (existing.status === "withdrawn") {
        const { data: updated, error } = await adminClient
          .from("breeder_waitlist")
          .update({ ...row, status: "waiting" })
          .eq("id", existing.id)
          .select("*")
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await sendWaitlistWelcome(adminClient, updated, breeder);
        return NextResponse.json({ success: true, rejoined: true });
      }
      return NextResponse.json({ success: true, alreadyJoined: true });
    }

    const { data: entry, error } = await adminClient.from("breeder_waitlist").insert(row).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sendWaitlistWelcome(adminClient, entry, breeder);
    return NextResponse.json({ success: true, entry: { id: entry.id } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });

    const adminClient = createAdminClient();
    const { data: breeder } = await adminClient
      .from("breeders")
      .select("id")
      .eq("slug", params.slug)
      .maybeSingle();

    if (!breeder) return NextResponse.json({ error: "Breeder not found." }, { status: 404 });

    await adminClient
      .from("breeder_waitlist")
      .update({ status: "withdrawn", updated_at: new Date().toISOString() })
      .eq("breeder_id", breeder.id)
      .ilike("email", email);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
