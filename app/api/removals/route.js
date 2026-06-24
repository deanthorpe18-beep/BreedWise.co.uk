import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { removalSchema } from "@/lib/validation";
import { rateLimitByIp } from "@/lib/rate-limit";
import { sendRemovalConfirmation } from "@/lib/emails/resend";

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
    const result = removalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join(" ") },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: "You must be logged in to submit a removal request." },
        { status: 401 }
      );
    }

    const removalData = {
      breeder_slug: result.data.breederSlug,
      breeder_name: result.data.breederName || null,
      requester_email: result.data.email,
      requester_name: result.data.name || null,
      requester_user_id: userData.user.id,
      reason: result.data.reason,
      gdpr_article_17: result.data.gdprRequest || false,
      status: "pending",
    };

    const { data, error } = await supabase.from("removals").insert(removalData).select().single();
    if (error) {
      return NextResponse.json(
        { error: "Unable to submit removal request. Please try again." },
        { status: 500 }
      );
    }

    Promise.allSettled([
      sendRemovalConfirmation(result.data.email, result.data.breederName || "your listing"),
    ]);

    return NextResponse.json(
      { message: "Removal request submitted successfully. It is now under review.", removalId: data.id },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
