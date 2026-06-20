import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = params;
    const body = await request.json();
    const { image_reviewed } = body;

    if (typeof image_reviewed !== "boolean") {
      return NextResponse.json({ error: "image_reviewed must be a boolean" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("breeds")
      .update({ image_reviewed })
      .eq("id", id)
      .select("id, name, slug, image_reviewed")
      .single();

    if (error) throw error;
    return NextResponse.json({ breed: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
