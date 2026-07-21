import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export const DEFAULT_TIER_CONFIG = {
  bronze: {
    name: "Bronze",
    monthlyPrice: 5.99,
    photoLimit: 5,
    searchPriority: 1,
    features: [
      "Claimed profile badge",
      "Up to 5 photos",
      "Contact form enquiries",
      "Standard search ranking",
      "Email support",
    ],
  },
  silver: {
    name: "Silver",
    monthlyPrice: 7.99,
    photoLimit: 10,
    searchPriority: 2,
    features: [
      "Everything in Bronze",
      "Priority search ranking",
      "Up to 10 photos",
      "Enquiry analytics dashboard",
      "Featured rotation eligibility",
      "Breeding portal (limited: 4 animals, 2 litters, 8 pups)",
      "Priority email support",
    ],
  },
  gold: {
    name: "Gold",
    monthlyPrice: 9.99,
    photoLimit: 999,
    searchPriority: 3,
    features: [
      "Everything in Silver",
      "Top search ranking",
      "Unlimited photos",
      "Full analytics suite",
      "Permanent featured slot",
      "Full breeding portal (unlimited records)",
      "Sale checklists, buyer records & receipts",
      "Printable council breeding summary",
      "Dedicated support",
      "Gold member badge on your profile",
    ],
  },
};

/**
 * Fetch active tier configuration from the database.
 * Falls back to DEFAULT_TIER_CONFIG if DB is empty.
 */
export async function getTierConfigFromDB(tier) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stripe_tiers")
    .select("*")
    .eq("tier", tier)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return DEFAULT_TIER_CONFIG[tier] || null;
  }

  return {
    name: data.name,
    monthlyPrice: parseFloat(data.monthly_price),
    photoLimit: data.photo_limit,
    searchPriority: data.search_priority,
    features: Array.isArray(data.features) ? data.features : JSON.parse(data.features),
    stripeProductId: data.stripe_product_id,
    stripePriceId: data.stripe_price_id,
    isPopular: data.is_popular,
  };
}

/**
 * Get all active tiers from the database.
 */
export async function getAllTiersFromDB() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stripe_tiers")
    .select("*")
    .eq("is_active", true)
    .order("search_priority", { ascending: true });

  if (error || !data?.length) {
    return Object.entries(DEFAULT_TIER_CONFIG).map(([tier, config]) => ({
      tier,
      ...config,
      stripePriceId: process.env[`STRIPE_PRICE_${tier.toUpperCase()}`] || null,
    }));
  }

  return data.map((row) => ({
    tier: row.tier,
    name: row.name,
    monthlyPrice: parseFloat(row.monthly_price),
    photoLimit: row.photo_limit,
    searchPriority: row.search_priority,
    features: Array.isArray(row.features) ? row.features : JSON.parse(row.features),
    stripeProductId: row.stripe_product_id,
    stripePriceId: row.stripe_price_id,
    isPopular: row.is_popular,
  }));
}

/**
 * Get the Stripe price ID for a tier from the database.
 * Falls back to env vars if DB has no price ID.
 */
export async function getPriceIdForTier(tier) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stripe_tiers")
    .select("stripe_price_id")
    .eq("tier", tier)
    .single();

  if (data?.stripe_price_id) return data.stripe_price_id;

  // Fallback to env var
  const envMap = {
    bronze: process.env.STRIPE_PRICE_BRONZE,
    silver: process.env.STRIPE_PRICE_SILVER,
    gold: process.env.STRIPE_PRICE_GOLD,
  };
  return envMap[tier] || null;
}

/**
 * Map a Stripe price ID back to a tier name using the database.
 * Falls back to env vars.
 */
export async function mapPriceIdToTier(priceId) {
  if (!priceId) return "free";

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stripe_tiers")
    .select("tier")
    .eq("stripe_price_id", priceId)
    .single();

  if (data?.tier) return data.tier;

  // Fallback to env var comparison
  if (priceId === process.env.STRIPE_PRICE_BRONZE) return "bronze";
  if (priceId === process.env.STRIPE_PRICE_SILVER) return "silver";
  if (priceId === process.env.STRIPE_PRICE_GOLD) return "gold";
  return "free";
}

/**
 * Create or update a Stripe product and price for a tier.
 * Returns { productId, priceId }.
 */
export async function syncTierToStripe(tier, config) {
  const stripe = getStripe();
  const supabase = createAdminClient();

  // Fetch existing DB record
  const { data: existing } = await supabase
    .from("stripe_tiers")
    .select("stripe_product_id, stripe_price_id")
    .eq("tier", tier)
    .single();

  let productId = existing?.stripe_product_id;

  // Create or update product
  if (productId) {
    await stripe.products.update(productId, {
      name: `${config.name} Membership`,
      description: `BreedWise ${config.name} membership — ${config.features?.length || 0} features`,
    });
  } else {
    const product = await stripe.products.create({
      name: `${config.name} Membership`,
      description: `BreedWise ${config.name} membership`,
      metadata: { tier },
    });
    productId = product.id;
  }

  // Create a new price (Stripe prices are immutable)
  const priceInPence = Math.round(config.monthlyPrice * 100);
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: priceInPence,
    currency: "gbp",
    recurring: { interval: "month" },
    metadata: { tier },
  });

  // Update DB with new IDs
  await supabase
    .from("stripe_tiers")
    .update({
      stripe_product_id: productId,
      stripe_price_id: price.id,
      name: config.name,
      monthly_price: config.monthlyPrice,
      photo_limit: config.photoLimit,
      search_priority: config.searchPriority,
      features: config.features,
      is_popular: config.isPopular,
      updated_at: new Date().toISOString(),
    })
    .eq("tier", tier);

  return { productId, priceId: price.id };
}

/**
 * Update tier config in DB without touching Stripe.
 */
export async function updateTierConfig(tier, updates) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("stripe_tiers")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("tier", tier);

  return { error };
}
