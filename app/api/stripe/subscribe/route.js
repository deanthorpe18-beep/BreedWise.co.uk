import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, createCheckoutSession } from "@/lib/stripe";
import { getPriceIdForTier } from "@/lib/stripe-tiers";

const VALID_TIERS = ["bronze", "silver", "gold"];

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { breederId, tier } = body;

    if (!breederId || !tier) {
      return NextResponse.json(
        { error: "breederId and tier are required" },
        { status: 400 }
      );
    }

    if (!VALID_TIERS.includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be bronze, silver, or gold" },
        { status: 400 }
      );
    }

    const priceId = await getPriceIdForTier(tier);
    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID not configured for this tier. Please sync Stripe tiers in admin." },
        { status: 500 }
      );
    }

    // Check if breeder already has a subscription owned by someone else
    // Fetch breeder slug for URLs
    const { data: breederRow } = await supabase
      .from("breeders")
      .select("slug")
      .eq("id", breederId)
      .maybeSingle();
    const breederSlug = breederRow?.slug || breederId;

    const { data: existingSub, error: subError } = await supabase
      .from("breeder_subscriptions")
      .select("id, user_id, stripe_customer_id, stripe_subscription_id, status")
      .eq("breeder_id", breederId)
      .maybeSingle();

    if (subError) {
      console.error("Error fetching subscription:", subError);
      return NextResponse.json(
        { error: "Unable to check existing subscription" },
        { status: 500 }
      );
    }

    if (existingSub && existingSub.user_id !== user.id) {
      return NextResponse.json(
        { error: "This breeder already has a subscription" },
        { status: 403 }
      );
    }

    const stripe = getStripe();
    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          breeder_id: breederId,
        },
      });
      customerId = customer.id;
    }

    const session = await createCheckoutSession(customerId, priceId, breederId, breederSlug);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe subscribe error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
