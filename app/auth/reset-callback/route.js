import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const siteUrl = getSiteUrl();

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL("/auth/reset", siteUrl));
      }
      console.error("[reset-callback] Code exchange failed:", error.message);
    }

    return NextResponse.redirect(new URL("/auth/reset?error=invalid_code", siteUrl));
  } catch (err) {
    console.error("[reset-callback] Unexpected error:", err?.message || err);
    return NextResponse.redirect(new URL("/auth/reset?error=invalid_code", siteUrl));
  }
}
