import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { processSearchAlerts } from "@/lib/search-alerts";

export const dynamic = "force-dynamic";

/** Daily cron: email users when new breeders match their saved search alerts */
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const result = await processSearchAlerts(admin);
    return NextResponse.json({ message: "Search alerts processed", ...result });
  } catch (err) {
    console.error("[cron/search-alerts]", err?.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
