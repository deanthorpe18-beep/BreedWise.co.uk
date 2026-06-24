import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validation";
import { rateLimitByIp, rateLimitByEmail } from "@/lib/rate-limit";
import { authCallbackUrl } from "@/lib/site-url";
import { buildClaimPath, postAuthPathForIntent } from "@/lib/breeder-onboarding";

async function recordOutreachConversion(adminClient, email, breederSlug, userId) {
  if (!breederSlug || !userId) return;

  const { data: send } = await adminClient
    .from("outreach_sends")
    .select("id")
    .eq("breeder_slug", breederSlug)
    .ilike("to_email", email.trim())
    .eq("status", "sent")
    .is("converted_at", null)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!send?.id) return;

  await adminClient
    .from("outreach_sends")
    .update({
      converted_at: new Date().toISOString(),
      converted_user_id: userId,
    })
    .eq("id", send.id);
}

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const body = await request.json();

    const ipLimit = rateLimitByIp(ip, 10, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a moment." },
        { status: 429 }
      );
    }

    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join(" ") },
        { status: 400 }
      );
    }

    const {
      displayName,
      email,
      password,
      accountIntent,
      signupSource,
      outreachBreederSlug,
      outreachBreederName,
    } = result.data;

    const emailLimit = rateLimitByEmail(email, 5, 3600000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts for this email. Please try again in an hour." },
        { status: 429 }
      );
    }

    const supabase = createClient();

    const userMetadata = {
      display_name: displayName,
      account_intent: accountIntent,
      signup_source: signupSource === "outreach" ? "outreach" : "website",
    };

    if (signupSource === "outreach" && outreachBreederSlug) {
      userMetadata.outreach_breeder_slug = outreachBreederSlug;
      if (outreachBreederName) {
        userMetadata.outreach_breeder_name = outreachBreederName;
      }
    }

    const nextPath = postAuthPathForIntent(accountIntent, userMetadata);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
        emailRedirectTo: authCallbackUrl(nextPath),
      },
    });

    if (error) {
      return NextResponse.json(
        { error: "Unable to create account. Please try again or contact support." },
        { status: 400 }
      );
    }

    if (data.user?.id && accountIntent === "buyer") {
      try {
        const adminClient = createAdminClient();
        await adminClient.from("profiles").update({ role: "buyer" }).eq("id", data.user.id);
      } catch (profileErr) {
        console.error("[signup] Failed to set buyer role:", profileErr?.message);
      }
    }

    if (data.user?.id && signupSource === "outreach" && outreachBreederSlug) {
      try {
        const adminClient = createAdminClient();
        await recordOutreachConversion(adminClient, email, outreachBreederSlug, data.user.id);
      } catch (convErr) {
        console.error("[signup] Outreach conversion tracking failed:", convErr?.message);
      }
    }

    return NextResponse.json(
      {
        message: "Account created. Please check your email to verify your address.",
        userId: data.user?.id,
        claimPath: accountIntent === "breeder" ? buildClaimPath(userMetadata) : null,
        fromOutreach: signupSource === "outreach",
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
