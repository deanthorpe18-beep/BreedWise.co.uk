import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation";
import { rateLimitAuth } from "@/lib/rate-limit";
import { buildClaimPath } from "@/lib/breeder-onboarding";

function safeRedirectPath(next) {
  if (!next || typeof next !== "string") return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

function hashString(str) {
  // Simple non-cryptographic hash for server-side logging/lookup
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
}

async function logAttempt(supabase, email, ip, succeeded) {
  try {
    await supabase.from("auth_attempts").insert({
      email_hash: email ? hashString(email.toLowerCase().trim()) : null,
      ip_hash: ip ? hashString(ip) : null,
      succeeded,
    });
  } catch {
    // Silent fail: never block login because logging failed
  }
}

async function isLockedOut(supabase, email, ip) {
  const emailHash = email ? hashString(email.toLowerCase().trim()) : null;
  const ipHash = ip ? hashString(ip) : null;
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 min window

  const { data } = await supabase
    .from("auth_attempts")
    .select("succeeded")
    .or(`email_hash.eq.${emailHash},ip_hash.eq.${ipHash}`)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!data || data.length < 5) return false;

  const recentFailures = data.filter((r) => !r.succeeded).length;
  return recentFailures >= 5;
}

export async function POST(request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for") || "unknown";
    const ip = forwarded.split(",")[0].trim();
    const body = await request.json();

    const limit = rateLimitAuth(ip, 5, 300000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    const { email, password, next: requestedNext } = result.data;
    const supabase = createClient();

    if (await isLockedOut(supabase, email, ip)) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please try again in 30 minutes." },
        { status: 429 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      await logAttempt(supabase, email, ip, false);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await logAttempt(supabase, email, ip, true);

    if (!data.user.email_confirmed_at) {
      // Return generic error to prevent account enumeration
      await logAttempt(supabase, email, ip, false);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role || "breeder";
    let redirectTo = "/";
    if (role === "admin" || role === "super_admin") {
      redirectTo = "/admin";
    } else if (role === "buyer") {
      redirectTo = "/account/saved-breeders";
    } else {
      // Check if this user is a breeder
      const { data: breederSub } = await supabase
        .from("breeder_subscriptions")
        .select("breeder_id")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (breederSub?.breeder_id) {
        redirectTo = "/breeder/dashboard";
      } else {
        const { data: claim } = await supabase
          .from("claims")
          .select("id")
          .eq("claimant_user_id", data.user.id)
          .eq("status", "approved")
          .maybeSingle();
        if (claim) {
          redirectTo = "/breeder/dashboard";
        } else {
          redirectTo = buildClaimPath(data.user.user_metadata || {});
        }
      }
    }

    const safeNext = safeRedirectPath(requestedNext);
    if (safeNext && role !== "admin" && role !== "super_admin") {
      redirectTo = safeNext;
    }

    return NextResponse.json({
      message: "Login successful.",
      role,
      redirectTo,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
