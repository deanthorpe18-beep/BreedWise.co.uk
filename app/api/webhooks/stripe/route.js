import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const breederId = session.metadata?.breeder_id;
        const stripeCustomerId = session.customer;
        const stripeSubscriptionId = session.subscription;

        if (!breederId || !stripeCustomerId || !stripeSubscriptionId) {
          console.error("Missing metadata in checkout.session.completed");
          break;
        }

        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const priceId = subscription.items?.data?.[0]?.price?.id;

        // Resolve user_id from existing subscription or Stripe customer metadata
        const { data: existingSub } = await supabase
          .from("breeder_subscriptions")
          .select("user_id")
          .eq("breeder_id", breederId)
          .maybeSingle();

        let userId = existingSub?.user_id;
        if (!userId) {
          const customer = await stripe.customers.retrieve(stripeCustomerId);
          userId = customer.metadata?.user_id;
        }

        if (!userId) {
          console.error("Could not resolve user_id for breeder:", breederId);
          break;
        }

        const { error: upsertError } = await supabase
          .from("breeder_subscriptions")
          .upsert(
            {
              breeder_id: breederId,
              user_id: userId,
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: stripeSubscriptionId,
              stripe_price_id: priceId,
              status: mapStripeStatus(subscription.status),
              tier: mapPriceIdToTier(priceId),
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "breeder_id" }
          );

        if (upsertError) {
          console.error("Error upserting subscription:", upsertError);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const stripeSubscriptionId = subscription.id;
        const priceId = subscription.items?.data?.[0]?.price?.id;

        const { data: existingSub, error: findError } = await supabase
          .from("breeder_subscriptions")
          .select("id")
          .eq("stripe_subscription_id", stripeSubscriptionId)
          .maybeSingle();

        if (findError || !existingSub) {
          console.error("Subscription not found for update:", stripeSubscriptionId);
          break;
        }

        const { error: updateError } = await supabase
          .from("breeder_subscriptions")
          .update({
            status: mapStripeStatus(subscription.status),
            tier: mapPriceIdToTier(priceId),
            stripe_price_id: priceId,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSub.id);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const stripeSubscriptionId = subscription.id;

        const { data: existingSub, error: findError } = await supabase
          .from("breeder_subscriptions")
          .select("id")
          .eq("stripe_subscription_id", stripeSubscriptionId)
          .maybeSingle();

        if (findError || !existingSub) {
          console.error("Subscription not found for deletion:", stripeSubscriptionId);
          break;
        }

        const { error: updateError } = await supabase
          .from("breeder_subscriptions")
          .update({
            status: "cancelled",
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSub.id);

        if (updateError) {
          console.error("Error marking subscription as cancelled:", updateError);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const stripeSubscriptionId = invoice.subscription;

        if (!stripeSubscriptionId) {
          console.error("No subscription on failed invoice");
          break;
        }

        const { data: existingSub, error: findError } = await supabase
          .from("breeder_subscriptions")
          .select("id")
          .eq("stripe_subscription_id", stripeSubscriptionId)
          .maybeSingle();

        if (findError || !existingSub) {
          console.error("Subscription not found for payment failure:", stripeSubscriptionId);
          break;
        }

        const { error: updateError } = await supabase
          .from("breeder_subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSub.id);

        if (updateError) {
          console.error("Error updating subscription past_due:", updateError);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function mapStripeStatus(stripeStatus) {
  const map = {
    active: "active",
    canceled: "cancelled",
    incomplete: "unpaid",
    incomplete_expired: "unpaid",
    past_due: "past_due",
    unpaid: "unpaid",
    paused: "unpaid",
    trialing: "active",
  };
  return map[stripeStatus] || "unpaid";
}

function mapPriceIdToTier(priceId) {
  if (priceId === process.env.STRIPE_PRICE_BRONZE) return "bronze";
  if (priceId === process.env.STRIPE_PRICE_SILVER) return "silver";
  if (priceId === process.env.STRIPE_PRICE_GOLD) return "gold";
  return "free";
}
