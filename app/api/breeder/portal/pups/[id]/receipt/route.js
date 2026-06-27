import { NextResponse } from "next/server";
import { authenticateBreederPortalGold } from "@/lib/breeder-portal-request-auth";
import { deletePupReceipt, getPupReceiptUrl, uploadPupReceipt } from "@/lib/pup-receipt-storage";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const auth = await authenticateBreederPortalGold(request);
  if (auth.response) return auth.response;

  try {
    const type = request.nextUrl.searchParams.get("type");
    const url = await getPupReceiptUrl(auth.adminClient, {
      breederId: auth.breederId,
      pupId: params.id,
      type,
    });
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}

export async function POST(request, { params }) {
  const auth = await authenticateBreederPortalGold(request);
  if (auth.response) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type");

    const pup = await uploadPupReceipt(auth.adminClient, {
      breederId: auth.breederId,
      pupId: params.id,
      type,
      file,
    });

    return NextResponse.json({ pup });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await authenticateBreederPortalGold(request);
  if (auth.response) return auth.response;

  try {
    const type = request.nextUrl.searchParams.get("type");
    const pup = await deletePupReceipt(auth.adminClient, {
      breederId: auth.breederId,
      pupId: params.id,
      type,
    });
    return NextResponse.json({ pup });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
