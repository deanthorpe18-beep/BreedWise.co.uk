import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireBreederPortal } from "@/lib/breeder-auth";
import { canUseSaleFeatures, goldSaleRequiredResponse } from "@/lib/breeder-portal-sale";
import { defaultReceiptSettings, draftToTemplateSettings } from "@/lib/breeder-receipts";

export const dynamic = "force-dynamic";

async function authGoldPortal() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: "Please log in." }, { status: 401 }) };
  const adminClient = createAdminClient();
  const portal = await requireBreederPortal(adminClient, user.id, user.email);
  if (portal.error) {
    return { response: NextResponse.json({ error: portal.error }, { status: portal.status }) };
  }
  if (!canUseSaleFeatures(portal.access)) {
    const blocked = goldSaleRequiredResponse();
    return { response: NextResponse.json({ error: blocked.error, goldRequired: true }, { status: blocked.status }) };
  }
  return { adminClient, breederId: portal.breederId };
}

export async function GET() {
  const auth = await authGoldPortal();
  if (auth.response) return auth.response;

  const { data, error } = await auth.adminClient
    .from("breeders")
    .select("receipt_settings")
    .eq("id", auth.breederId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const saved = data?.receipt_settings && typeof data.receipt_settings === "object" ? data.receipt_settings : {};
  const defaults = defaultReceiptSettings();

  return NextResponse.json({
    settings: {
      deposit: { ...defaults.deposit, ...(saved.deposit || {}) },
      final: { ...defaults.final, ...(saved.final || {}) },
    },
  });
}

export async function PATCH(request) {
  const auth = await authGoldPortal();
  if (auth.response) return auth.response;

  const body = await request.json();
  const type = body.type;
  if (type !== "deposit" && type !== "final") {
    return NextResponse.json({ error: "Specify type as deposit or final." }, { status: 400 });
  }

  const template = body.template || body.settings?.[type] || body.draft;
  if (!template) {
    return NextResponse.json({ error: "No template provided." }, { status: 400 });
  }

  const { data: existing } = await auth.adminClient
    .from("breeders")
    .select("receipt_settings")
    .eq("id", auth.breederId)
    .single();

  const current =
    existing?.receipt_settings && typeof existing.receipt_settings === "object"
      ? existing.receipt_settings
      : {};

  const nextSettings = {
    ...current,
    [type]: {
      ...(current[type] || {}),
      ...draftToTemplateSettings(template),
    },
  };

  const { error } = await auth.adminClient
    .from("breeders")
    .update({ receipt_settings: nextSettings, updated_at: new Date().toISOString() })
    .eq("id", auth.breederId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, settings: nextSettings });
}
