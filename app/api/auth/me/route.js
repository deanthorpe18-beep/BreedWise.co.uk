import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Check if user owns a breeder listing
    const { data: subscription } = await supabase
      .from("breeder_subscriptions")
      .select("breeder_id, breeders(slug, name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: profile?.display_name || user.email,
        role: profile?.role || "breeder",
        emailConfirmed: !!user.email_confirmed_at,
        breederId: subscription?.breeder_id || null,
        breederSlug: subscription?.breeders?.slug || null,
        breederName: subscription?.breeders?.name || null,
      },
    });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
