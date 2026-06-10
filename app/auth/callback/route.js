import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(`/auth/verified?success=true&next=${encodeURIComponent(next)}`, request.url));
      }
      console.error("[auth/callback] Code exchange failed:", error.message);
    }

    return NextResponse.redirect(new URL("/auth/verified?error=verification_failed", request.url));
  } catch (err) {
    console.error("[auth/callback] Unexpected error:", err?.message || err);
    return NextResponse.redirect(new URL("/auth/verified?error=verification_failed", request.url));
  }
}
