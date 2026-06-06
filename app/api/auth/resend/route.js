import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitByEmail, rateLimitByIp } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const ipLimit = rateLimitByIp(ip, 5, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const emailLimit = rateLimitByEmail(email, 3, 3600000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://breedwise.co.uk"}/auth/callback`,
      },
    });

    if (error) {
      // Supabase enforces a 60-second cooldown between resends
      const isRateLimited =
        error.message?.toLowerCase().includes("once every") ||
        error.message?.toLowerCase().includes("rate limit") ||
        error.status === 429;

      if (isRateLimited) {
        return NextResponse.json(
          { error: "Please wait 60 seconds before requesting another email." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Unable to resend email. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
