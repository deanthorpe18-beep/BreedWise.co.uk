import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("breeds")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Breed not found" }, { status: 404 });
    }

    // Fetch related breeds (same group or size) with encyclopedia data
    const { data: related } = await adminClient
      .from("breeds")
      .select("name, slug, group_name, size, image_url")
      .neq("slug", slug)
      .or(`group_name.eq.${data.group_name},size.eq.${data.size}`)
      .not("description", "is", null)
      .neq("description", "")
      .eq("is_popular", true)
      .limit(4);

    // Count breeders for this breed
    const { count: breederCount } = await adminClient
      .from("breeder_breeds")
      .select("*", { count: "exact", head: true })
      .eq("breed", data.name);

    return NextResponse.json({
      breed: data,
      related: related || [],
      breederCount: breederCount || 0,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
