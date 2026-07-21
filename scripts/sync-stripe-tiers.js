/**
 * Sync Bronze/Silver/Gold tiers to Stripe and store price IDs in stripe_tiers.
 *
 * Run: npx railway run node scripts/sync-stripe-tiers.js
 * Or:  STRIPE_SECRET_KEY=... SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... node scripts/sync-stripe-tiers.js
 */

const Stripe = require("stripe");
const { getSupabaseAdmin, requireEnv } = require("./_env");

const DEFAULT_TIERS = {
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
    isPopular: false,
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
    isPopular: true,
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
    isPopular: false,
  },
};

async function syncTier(stripe, supabase, tier, config) {
  const { data: existing } = await supabase
    .from("stripe_tiers")
    .select("stripe_product_id, stripe_price_id")
    .eq("tier", tier)
    .single();

  let productId = existing?.stripe_product_id;

  if (productId) {
    await stripe.products.update(productId, {
      name: `${config.name} Membership`,
      description: `BreedWise ${config.name} membership`,
    });
  } else {
    const product = await stripe.products.create({
      name: `${config.name} Membership`,
      description: `BreedWise ${config.name} membership`,
      metadata: { tier },
    });
    productId = product.id;
  }

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: Math.round(config.monthlyPrice * 100),
    currency: "gbp",
    recurring: { interval: "month" },
    metadata: { tier },
  });

  const { error } = await supabase
    .from("stripe_tiers")
    .upsert(
      {
        tier,
        name: config.name,
        monthly_price: config.monthlyPrice,
        photo_limit: config.photoLimit,
        search_priority: config.searchPriority,
        features: config.features,
        is_popular: config.isPopular,
        is_active: true,
        stripe_product_id: productId,
        stripe_price_id: price.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tier" }
    );

  if (error) throw error;
  return { tier, productId, priceId: price.id };
}

async function main() {
  requireEnv("STRIPE_SECRET_KEY");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  const supabase = getSupabaseAdmin();

  const results = [];
  for (const [tier, config] of Object.entries(DEFAULT_TIERS)) {
    const result = await syncTier(stripe, supabase, tier, config);
    results.push(result);
    console.log(`✓ ${tier}: ${result.priceId}`);
  }

  console.log("\nAll tiers synced:", results.length);
}

main().catch((err) => {
  console.error("Stripe sync failed:", err.message);
  process.exit(1);
});
