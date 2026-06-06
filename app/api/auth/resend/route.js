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
    await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://breedwise.co.uk"}/auth/callback`,
      },
    });

    return NextResponse.json({
      message: "If an account exists with this email, a verification link has been sent.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
