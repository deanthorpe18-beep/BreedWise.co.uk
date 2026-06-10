import Stripe from "stripe";

let stripeInstance = null;

export function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });
  }
  return stripeInstance;
}

export function getPriceIdForTier(tier) {
  const map = {
    bronze: process.env.STRIPE_PRICE_BRONZE,
    silver: process.env.STRIPE_PRICE_SILVER,
    gold: process.env.STRIPE_PRICE_GOLD,
  };
  return map[tier] || null;
}

export async function createCheckoutSession(customerId, priceId, breederId) {
  const stripe = getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/breeder/${breederId}/subscription?success=true`,
    cancel_url: `${siteUrl}/breeder/${breederId}/subscription?canceled=true`,
    metadata: {
      breeder_id: breederId,
    },
    subscription_data: {
      metadata: {
        breeder_id: breederId,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  return session;
}
