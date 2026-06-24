import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { processAdminWeeklyDigest } from "@/lib/admin-weekly-digest";

export const dynamic = "force-dynamic";

/** Weekly cron: signups, removals, and outreach follow-up summary */
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const result = await processAdminWeeklyDigest(admin);
    return NextResponse.json({
      message: result.sent
        ? `Weekly admin digest sent (${result.signups} signups, ${result.removals} removals)`
        : "No admin activity since last digest",
      ...result,
    });
  } catch (err) {
    console.error("[cron/admin-weekly-digest]", err?.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
