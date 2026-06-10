import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

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
      .select("id, user_id, stripe_subscription_id")
      .eq("breeder_id", breederId)
      .maybeSingle();

    if (subError) {
      console.error("Error fetching subscription:", subError);
      return NextResponse.json(
        { error: "Unable to fetch subscription" },
        { status: 500 }
      );
    }

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

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active Stripe subscription" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ success: true, message: "Subscription will cancel at period end" });
  } catch (err) {
    console.error("Stripe cancel error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
