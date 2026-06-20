import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(
          new URL("/auth/reset", request.url)
        );
      }
      console.error("[reset-callback] Code exchange failed:", error.message);
    }

    return NextResponse.redirect(
      new URL("/auth/reset?error=invalid_code", request.url)
    );
  } catch (err) {
    console.error("[reset-callback] Unexpected error:", err?.message || err);
    return NextResponse.redirect(
      new URL("/auth/reset?error=invalid_code", request.url)
    );
  }
}
