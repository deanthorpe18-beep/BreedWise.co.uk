import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validation";
import { rateLimitByIp } from "@/lib/rate-limit";
import { sendContactConfirmation } from "@/lib/emails/resend";

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimitByIp(ip, 5, 60000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join(" ") },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase.from("contact_submissions").insert(result.data).select().single();

    if (error) {
      return NextResponse.json(
        { error: "Unable to send message. Please try again." },
        { status: 500 }
      );
    }

    sendContactConfirmation(result.data.email).catch(() => {});

    return NextResponse.json(
      { message: "Message sent successfully." },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
