import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { forgotSchema } from "@/lib/validation";
import { rateLimitByIp, rateLimitByEmail } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const body = await request.json();

    const ipLimit = rateLimitByIp(ip, 5, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const result = forgotSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const emailLimit = rateLimitByEmail(email, 3, 3600000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://breedwise.co.uk"}/auth/reset-callback`,
    });

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link shortly.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
