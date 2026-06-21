import { NextResponse } from "next/server";
import { authenticateBreederPortalGold } from "@/lib/breeder-portal-request-auth";
import {
  RECEIPT_TYPES,
  buildReceiptDraft,
  sanitizeReceiptDraft,
  draftToTemplateSettings,
} from "@/lib/breeder-receipts";

export const dynamic = "force-dynamic";

async function loadPupContext(adminClient, breederId, pupId) {
  const { data: pup, error } = await adminClient
    .from("breeding_litter_animals")
    .select("*")
    .eq("id", pupId)
    .eq("breeder_id", breederId)
    .maybeSingle();

  if (error || !pup) return { error: "Pup not found.", status: 404 };

  const { data: litter } = await adminClient
    .from("breeding_litters")
    .select("id, breed, birth_date, expected_go_home_date, litter_name")
    .eq("id", pup.litter_id)
    .maybeSingle();

  const { data: breeder } = await adminClient
    .from("breeders")
    .select(
      "name, address, town, county, postcode, phone, email, website, council_licence, kennel_club, receipt_settings"
    )
    .eq("id", breederId)
    .single();

  return { pup, litter, breeder };
}

export async function GET(request, { params }) {
  const auth = await authenticateBreederPortalGold(request);
  if (auth.response) return auth.response;

  const type = request.nextUrl.searchParams.get("type");
  if (!RECEIPT_TYPES.includes(type)) {
    return NextResponse.json({ error: "Specify type=deposit or type=final." }, { status: 400 });
  }

  const ctx = await loadPupContext(auth.adminClient, auth.breederId, params.id);
  if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const savedDrafts =
    ctx.pup.receipt_drafts && typeof ctx.pup.receipt_drafts === "object" ? ctx.pup.receipt_drafts : {};
  const draft = buildReceiptDraft({
    type,
    breeder: ctx.breeder,
    pup: ctx.pup,
    litter: ctx.litter,
    receiptSettings: ctx.breeder.receipt_settings,
    savedDraft: savedDrafts[type],
  });

  return NextResponse.json({
    draft,
    litterId: ctx.litter?.id,
    litterName: ctx.litter?.litter_name || ctx.litter?.breed,
  });
}

export async function PATCH(request, { params }) {
  const auth = await authenticateBreederPortalGold(request);
  if (auth.response) return auth.response;

  const body = await request.json();
  const type = body.type;
  if (!RECEIPT_TYPES.includes(type)) {
    return NextResponse.json({ error: "Specify type as deposit or final." }, { status: 400 });
  }

  const sanitized = sanitizeReceiptDraft(body.draft);
  if (!sanitized) {
    return NextResponse.json({ error: "Invalid receipt draft." }, { status: 400 });
  }

  const ctx = await loadPupContext(auth.adminClient, auth.breederId, params.id);
  if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const currentDrafts =
    ctx.pup.receipt_drafts && typeof ctx.pup.receipt_drafts === "object" ? ctx.pup.receipt_drafts : {};

  const { data, error } = await auth.adminClient
    .from("breeding_litter_animals")
    .update({
      receipt_drafts: { ...currentDrafts, [type]: sanitized },
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .eq("breeder_id", auth.breederId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pup: data, draft: sanitized });
}

export async function POST(request, { params }) {
  const auth = await authenticateBreederPortalGold(request);
  if (auth.response) return auth.response;

  const body = await request.json();
  const type = body.type;
  const action = body.action;

  if (action === "save-default") {
    if (!RECEIPT_TYPES.includes(type)) {
      return NextResponse.json({ error: "Specify type as deposit or final." }, { status: 400 });
    }
    const sanitized = sanitizeReceiptDraft(body.draft);
    if (!sanitized) {
      return NextResponse.json({ error: "Invalid receipt draft." }, { status: 400 });
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
        ...draftToTemplateSettings(sanitized),
      },
    };

    const { error } = await auth.adminClient
      .from("breeders")
      .update({ receipt_settings: nextSettings, updated_at: new Date().toISOString() })
      .eq("id", auth.breederId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, settings: nextSettings });
  }

  if (action === "reset") {
    if (!RECEIPT_TYPES.includes(type)) {
      return NextResponse.json({ error: "Specify type as deposit or final." }, { status: 400 });
    }

    const ctx = await loadPupContext(auth.adminClient, auth.breederId, params.id);
    if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

    const currentDrafts =
      ctx.pup.receipt_drafts && typeof ctx.pup.receipt_drafts === "object" ? ctx.pup.receipt_drafts : {};
    const { [type]: _removed, ...rest } = currentDrafts;

    const draft = buildReceiptDraft({
      type,
      breeder: ctx.breeder,
      pup: ctx.pup,
      litter: ctx.litter,
      receiptSettings: ctx.breeder.receipt_settings,
      savedDraft: null,
    });

    await auth.adminClient
      .from("breeding_litter_animals")
      .update({ receipt_drafts: rest, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("breeder_id", auth.breederId);

    return NextResponse.json({ draft });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
