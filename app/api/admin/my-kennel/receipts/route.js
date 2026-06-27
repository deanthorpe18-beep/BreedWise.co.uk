import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminKennelConfig } from "@/lib/admin-kennel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = createAdminClient();
    const config = await getAdminKennelConfig(adminClient);
    if (!config?.id) {
      return NextResponse.json({ error: "My Kennel is not configured." }, { status: 400 });
    }

    const { data: pups, error } = await adminClient
      .from("breeding_litter_animals")
      .select(
        `id, name, sex, status, buyer_name, buyer_email, buyer_phone, buyer_address,
         deposit_received, deposit_date, deposit_amount, deposit_receipt_path,
         paid_in_full, final_payment_date, sale_price, final_receipt_path, go_home_date,
         litter:breeding_litters(id, breed, litter_name)`
      )
      .eq("breeder_id", config.id)
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({
      breederId: config.id,
      pups: pups || [],
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unable to load receipts." }, { status: 500 });
  }
}
