import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validation";
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

    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join(" ") },
        { status: 400 }
      );
    }

    const { displayName, email, password } = result.data;

    const emailLimit = rateLimitByEmail(email, 3, 3600000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://breedwise.co.uk"}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: "Unable to create account. Please try again or contact support." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Account created. Please check your email to verify your address.",
        userId: data.user?.id,
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
