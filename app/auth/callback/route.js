import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/emails/resend";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Send welcome email asynchronously — do not block redirect
        if (data?.user?.email) {
          const displayName = data.user.user_metadata?.display_name || data.user.user_metadata?.full_name || "there";
          sendWelcomeEmail(data.user.email, displayName).catch((err) => {
            console.error("[auth/callback] Welcome email failed:", err?.message || err);
          });
        }
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
