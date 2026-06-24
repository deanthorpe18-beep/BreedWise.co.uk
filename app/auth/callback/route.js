import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/emails/resend";
import { getSiteUrl } from "@/lib/site-url";
import { postAuthPathForIntent } from "@/lib/breeder-onboarding";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const nextParam = searchParams.get("next");
    const siteUrl = getSiteUrl();

    if (code) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const metadata = data.user?.user_metadata || {};
        const intent = metadata.account_intent || "breeder";
        const next = postAuthPathForIntent(intent, metadata, nextParam);

        if (data?.user?.email) {
          const displayName =
            metadata.display_name || metadata.full_name || "there";
          sendWelcomeEmail(data.user.email, displayName, intent, metadata).catch((err) => {
            console.error("[auth/callback] Welcome email failed:", err?.message || err);
          });
        }

        const verifiedUrl = new URL("/auth/verified", siteUrl);
        verifiedUrl.searchParams.set("success", "true");
        verifiedUrl.searchParams.set("next", next);
        verifiedUrl.searchParams.set("intent", intent);
        if (metadata.signup_source === "outreach") {
          verifiedUrl.searchParams.set("from", "outreach");
          if (metadata.outreach_breeder_name) {
            verifiedUrl.searchParams.set("breeder", metadata.outreach_breeder_name);
          }
        }
        return NextResponse.redirect(verifiedUrl);
      }
      console.error("[auth/callback] Code exchange failed:", error.message);
    }

    return NextResponse.redirect(
      new URL("/auth/verified?error=verification_failed", siteUrl)
    );
  } catch (err) {
    console.error("[auth/callback] Unexpected error:", err?.message || err);
    return NextResponse.redirect(
      new URL("/auth/verified?error=verification_failed", getSiteUrl())
    );
  }
}
