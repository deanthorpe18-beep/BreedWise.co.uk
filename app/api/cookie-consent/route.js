import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(request) {
    try {
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const limit = rateLimitByIp(ip, 10, 60000);
        if (!limit.allowed) {
          return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
        }

        const body = await request.json();
        const supabase = createClient();

        // Try to get user if authenticated
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase.from("cookie_consents").insert({
            user_id: user?.id || null,
            consent_given: body.consent_given ?? false,
            essential: body.essential ?? true,
            analytics: body.analytics ?? false,
            marketing: body.marketing ?? false,
            preferences: body.preferences || null,
        });

        if (error) {
            console.error("Cookie consent log error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Cookie consent endpoint error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
