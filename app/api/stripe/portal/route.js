import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/site-url";

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { breederId } = body;

    if (!breederId) {
      return NextResponse.json(
        { error: "breederId is required" },
        { status: 400 }
      );
    }

    const { data: subscription, error: subError } = await supabase
      .from("breeder_subscriptions")
      .select("id, user_id, stripe_customer_id")
      .eq("breeder_id", breederId)
      .maybeSingle();

    if (subError) {
      console.error("Error fetching subscription:", subError);
      return NextResponse.json(
        { error: "Unable to fetch subscription" },
        { status: 500 }
      );
    }

    // Fetch breeder slug for return URL
    const { data: breederRow } = await supabase
      .from("breeders")
      .select("slug")
      .eq("id", breederId)
      .maybeSingle();
    const breederSlug = breederRow?.slug || breederId;

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found for this breeder" },
        { status: 404 }
      );
    }

    if (subscription.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (!subscription.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const siteUrl = getSiteUrl();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${siteUrl}/breeder/${breederSlug}/subscription`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
