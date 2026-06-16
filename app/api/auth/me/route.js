import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, display_name")
      .eq("id", user.id)
      .single();

    let breederId = null;
    let breederSlug = null;
    let breederName = null;

    // 1. Try breeder_subscriptions first
    const { data: subscription } = await supabase
      .from("breeder_subscriptions")
      .select("breeder_id, breeders(slug, name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (subscription?.breeders?.slug) {
      breederId = subscription.breeder_id;
      breederSlug = subscription.breeders.slug;
      breederName = subscription.breeders.name;
    }

    // 2. Fallback: check approved claims
    if (!breederSlug) {
      const { data: claim } = await supabase
        .from("claims")
        .select("breeder_slug, breeder_name")
        .eq("claimant_user_id", user.id)
        .eq("status", "approved")
        .order("reviewed_at", { ascending: false })
        .maybeSingle();

      if (claim?.breeder_slug) {
        breederSlug = claim.breeder_slug;
        breederName = claim.breeder_name;
        const { data: breederRow } = await supabase
          .from("breeders")
          .select("id, name")
          .eq("slug", claim.breeder_slug)
          .maybeSingle();
        if (breederRow) {
          breederId = breederRow.id;
          breederName = breederRow.name || breederName;
        }
      }
    }

    // 3. Last resort: check if any breeder has this user's email
    if (!breederSlug) {
      const { data: breederByEmail } = await supabase
        .from("breeders")
        .select("id, slug, name")
        .eq("email", user.email)
        .eq("status", "claimed_profile")
        .maybeSingle();

      if (breederByEmail) {
        breederId = breederByEmail.id;
        breederSlug = breederByEmail.slug;
        breederName = breederByEmail.name;
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: profile?.display_name || user.email,
        role: profile?.role || "breeder",
        emailConfirmed: !!user.email_confirmed_at,
        breederId,
        breederSlug,
        breederName,
      },
    });
  } catch (err) {
    console.error("[auth/me] Error:", err?.message);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
