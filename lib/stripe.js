import Stripe from "stripe";
import { getSiteUrl } from "@/lib/site-url";

let stripeInstance = null;

export function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });
  }
  return stripeInstance;
}

export async function createCheckoutSession(customerId, priceId, breederId, breederSlug) {
  const stripe = getStripe();
  const siteUrl = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/breeder/${breederSlug}/subscription?success=true`,
    cancel_url: `${siteUrl}/breeder/${breederSlug}/subscription?canceled=true`,
    metadata: {
      breeder_id: breederId,
      breeder_slug: breederSlug,
    },
    subscription_data: {
      metadata: {
        breeder_id: breederId,
        breeder_slug: breederSlug,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  return session;
}

// Re-export tier helpers from stripe-tiers for backwards compatibility
export { getPriceIdForTier } from "@/lib/stripe-tiers";
