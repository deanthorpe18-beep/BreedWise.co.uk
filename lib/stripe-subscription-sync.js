/** Keep breeders.membership_tier and Gold featured status in sync with Stripe subscriptions. */

export async function syncBreederTierFromSubscription(
  supabase,
  breederId,
  tier,
  subscriptionStatus
) {
  if (!breederId) return;

  const active = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const effectiveTier = active && tier ? tier : "free";

  const update = {
    membership_tier: effectiveTier,
  };

  if (active && tier === "gold") {
    const until = new Date();
    until.setMonth(until.getMonth() + 2);
    update.is_featured = true;
    update.featured_until = until.toISOString();
    update.featured_priority = 10;
  } else if (tier !== "gold" || !active) {
    update.is_featured = false;
    update.featured_until = null;
    update.featured_priority = 0;
  }

  const { error } = await supabase.from("breeders").update(update).eq("id", breederId);
  if (error) {
    console.error("[stripe-sync] breeder tier update failed:", error.message);
  }
}

export async function getBreederIdForSubscription(supabase, stripeSubscriptionId) {
  const { data } = await supabase
    .from("breeder_subscriptions")
    .select("breeder_id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();
  return data?.breeder_id || null;
}
