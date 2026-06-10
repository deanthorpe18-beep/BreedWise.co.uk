import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// In-memory store for CMS content (no table needed for simple use case)
// In production, this should be backed by a DB table or KV store
let cmsStore = {
  hero_title: "Find your perfect companion",
  hero_subtitle: "Compare dog breeder listings across the UK. Read reviews, filter by breed and location, and find the right breeder for your family.",
  hero_cta_primary: "Search breeders",
  hero_cta_secondary: "Buyer guides",
  trust_banner_text: "BreedWise is a directory only. We do not sell puppies or endorse breeders.",
  contact_email: "help@breedwise.co.uk",
};

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Try to load from DB if table exists
    const adminClient = createAdminClient();
    const { data } = await adminClient.from("cms_content").select("key, value");
    if (data && data.length > 0) {
      data.forEach((row) => { cmsStore[row.key] = row.value; });
    }

    return NextResponse.json({ content: cmsStore });
  } catch {
    return NextResponse.json({ content: cmsStore });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof value !== "string") {
      return NextResponse.json({ error: "key and value required" }, { status: 400 });
    }

    cmsStore[key] = value;

    // Also try to persist to DB
    try {
      const adminClient = createAdminClient();
      await adminClient.from("cms_content").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    } catch {
      // Table may not exist, in-memory is fine for now
    }

    return NextResponse.json({ success: true, content: cmsStore });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

    delete cmsStore[key];

    try {
      const adminClient = createAdminClient();
      await adminClient.from("cms_content").delete().eq("key", key);
    } catch {}

    return NextResponse.json({ success: true, content: cmsStore });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
