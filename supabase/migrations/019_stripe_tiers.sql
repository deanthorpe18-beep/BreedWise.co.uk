-- Migration 019: Stripe tier configuration table for dynamic pricing

CREATE TABLE IF NOT EXISTS public.stripe_tiers (
  tier text PRIMARY KEY,
  name text NOT NULL,
  monthly_price numeric(10,2) NOT NULL,
  photo_limit integer NOT NULL DEFAULT 0,
  search_priority integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]',
  stripe_product_id text,
  stripe_price_id text,
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed with default tier data
INSERT INTO public.stripe_tiers (
  tier, name, monthly_price, photo_limit, search_priority, features,
  is_popular, is_active
)
VALUES
  ('bronze', 'Bronze', 5.99, 5, 1,
   '["Claimed profile badge","Up to 5 photos","Contact form enquiries","Standard search ranking","Email support"]',
   false, true),
  ('silver', 'Silver', 7.99, 10, 2,
   '["Everything in Bronze","Priority search ranking","Up to 10 photos","Enquiry analytics dashboard","Featured rotation eligibility","Priority email support"]',
   true, true),
  ('gold', 'Gold', 9.99, 999, 3,
   '["Everything in Silver","Top search ranking","Unlimited photos","Full analytics suite","Permanent featured slot","Dedicated support","Verified badge"]',
   false, true)
ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_price = EXCLUDED.monthly_price,
  photo_limit = EXCLUDED.photo_limit,
  search_priority = EXCLUDED.search_priority,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular,
  is_active = EXCLUDED.is_active;

-- RLS: allow public read
ALTER TABLE public.stripe_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY stripe_tiers_select_public
  ON public.stripe_tiers FOR SELECT
  USING (true);

CREATE POLICY stripe_tiers_admin_all
  ON public.stripe_tiers FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
