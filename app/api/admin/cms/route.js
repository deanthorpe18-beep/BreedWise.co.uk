import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_CMS } from "@/lib/cms-content";

export const dynamic = "force-dynamic";

async function loadCmsStore(adminClient) {
  const content = { ...DEFAULT_CMS };
  const { data } = await adminClient.from("cms_content").select("key, value");
  for (const row of data || []) {
    if (row.key && typeof row.value === "string") {
      content[row.key] = row.value;
    }
  }
  return content;
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = createAdminClient();
    const content = await loadCmsStore(adminClient);
    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("cms_content")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) throw error;

    const content = await loadCmsStore(adminClient);
    return NextResponse.json({ success: true, content });
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

    const adminClient = createAdminClient();
    await adminClient.from("cms_content").delete().eq("key", key);

    const content = await loadCmsStore(adminClient);
    return NextResponse.json({ success: true, content });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
