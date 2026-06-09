import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { claimSchema } from "@/lib/validation";
import { rateLimitByIp } from "@/lib/rate-limit";
import { sendClaimConfirmation, sendClaimAdminNotification } from "@/lib/emails/resend";

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
    const result = claimSchema.safeParse(body);
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
        { error: "You must be logged in to submit a claim." },
        { status: 401 }
      );
    }

    const claimData = {
      breeder_slug: result.data.breederSlug,
      breeder_name: result.data.breederName || null,
      claimant_email: result.data.email,
      claimant_name: result.data.name || null,
      claimant_user_id: userData.user.id,
      notes: result.data.notes || null,
      status: "pending",
    };

    const { data, error } = await supabase.from("claims").insert(claimData).select().single();
    if (error) {
      return NextResponse.json({ error: "Unable to submit claim. Please try again." }, { status: 500 });
    }

    // Store evidence if provided
    const evidence = body.evidence || {};
    const evidenceEntries = Object.entries(evidence).filter(([, v]) => v?.url);
    if (evidenceEntries.length > 0) {
      const adminClient = createAdminClient();
      await adminClient.from("claim_evidence").insert(
        evidenceEntries.map(([type, file]) => ({
          claim_id: data.id,
          evidence_type: type,
          file_url: file.url,
          file_name: file.name,
          file_size: file.size,
        }))
      );
    }

    // Send emails asynchronously; do not block response on email delivery
    Promise.allSettled([
      sendClaimConfirmation(result.data.email, result.data.breederName || "your listing"),
      sendClaimAdminNotification(result.data.breederName || "Unknown", result.data.email),
    ]);

    return NextResponse.json(
      { message: "Claim submitted successfully. It is now under review.", claimId: data.id },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
