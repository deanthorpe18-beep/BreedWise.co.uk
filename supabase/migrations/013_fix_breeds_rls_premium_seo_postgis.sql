-- Migration 013: Fix breeds RLS, Premium memberships, SEO tables, PostGIS, Analytics
-- Run in Supabase SQL Editor

-- ============================================================================
-- 1. FIX BREEDS TABLE RLS (public read access)
-- ============================================================================
ALTER TABLE IF EXISTS public.breeds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read breeds" ON public.breeds;
CREATE POLICY "Anyone can read breeds"
  ON public.breeds
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- 2. PREMIUM MEMBERSHIPS / STRIPE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.breeder_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('free', 'bronze', 'silver', 'gold')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(breeder_id)
);

CREATE INDEX IF NOT EXISTS idx_breeder_subs_breeder ON public.breeder_subscriptions(breeder_id);
CREATE INDEX IF NOT EXISTS idx_breeder_subs_tier ON public.breeder_subscriptions(tier, status);

ALTER TABLE public.breeder_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.breeder_subscriptions;
CREATE POLICY "Users can manage own subscriptions"
  ON public.breeder_subscriptions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.breeder_subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON public.breeder_subscriptions
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 3. BREEDER PHOTOS ENHANCEMENT (premium image limits)
-- ============================================================================
ALTER TABLE public.breeder_photos
  ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS uploaded_at timestamptz DEFAULT now();

-- ============================================================================
-- 4. BREEDER MEMBERSHIP TIER COLUMN (for fast search ranking)
-- ============================================================================
ALTER TABLE public.breeders
  ADD COLUMN IF NOT EXISTS membership_tier text DEFAULT 'unclaimed' CHECK (membership_tier IN ('unclaimed', 'free', 'bronze', 'silver', 'gold')),
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_until timestamptz,
  ADD COLUMN IF NOT EXISTS featured_priority integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_breeders_membership ON public.breeders(membership_tier, is_featured, featured_priority);

-- Update existing claimed breeders to 'free' tier
UPDATE public.breeders SET membership_tier = 'free' WHERE claimed = true AND membership_tier = 'unclaimed';

-- ============================================================================
-- 5. SEARCH ANALYTICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  query text,
  breed text,
  location text,
  max_distance text,
  sort_by text,
  result_count integer,
  has_results boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id),
  ip_hash text,
  user_agent text,
  searched_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_analytics_breed ON public.search_analytics(breed, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_location ON public.search_analytics(location, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_no_results ON public.search_analytics(has_results, searched_at DESC) WHERE has_results = false;

ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view search analytics" ON public.search_analytics;
CREATE POLICY "Admins can view search analytics"
  ON public.search_analytics
  FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Users can insert own searches" ON public.search_analytics;
CREATE POLICY "Users can insert own searches"
  ON public.search_analytics
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ============================================================================
-- 6. FEATURED BREEDER ROTATION LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.featured_rotation_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  shown_at timestamptz DEFAULT now(),
  shown_on_page text,
  slot_position integer DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_featured_rotation ON public.featured_rotation_log(breeder_id, shown_at DESC);

ALTER TABLE public.featured_rotation_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view rotation log" ON public.featured_rotation_log;
CREATE POLICY "Admins can view rotation log"
  ON public.featured_rotation_log
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 7. POSTGIS EXTENSION (for advanced geo search)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column for breeders
ALTER TABLE public.breeders
  ADD COLUMN IF NOT EXISTS location_geom geometry(Point, 4326);

-- Populate geometry from lat/lng
UPDATE public.breeders
SET location_geom = ST_SetSRID(ST_MakePoint(lng::float, lat::float), 4326)
WHERE lat IS NOT NULL AND lng IS NOT NULL AND location_geom IS NULL;

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_breeders_geom ON public.breeders USING GIST(location_geom);

-- Create function for distance search
CREATE OR REPLACE FUNCTION nearby_breeders(
  search_lat float,
  search_lng float,
  max_distance_miles float DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  town text,
  county text,
  lat numeric,
  lng numeric,
  distance_miles float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.slug,
    b.name,
    b.town,
    b.county,
    b.lat,
    b.lng,
    (ST_Distance(
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
      b.location_geom::geography
    ) / 1609.344)::float AS distance_miles
  FROM public.breeders b
  WHERE b.status IN ('public_listing', 'claimed_profile')
    AND b.location_geom IS NOT NULL
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
      b.location_geom::geography,
      max_distance_miles * 1609.344
    )
  ORDER BY distance_miles;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. SEO PAGES TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.seo_page_views (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_type text NOT NULL, -- 'breed', 'location', 'breed_location', 'breeder_profile', 'search'
  page_slug text NOT NULL,
  breed text,
  location text,
  view_count integer DEFAULT 1,
  last_viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(page_type, page_slug, breed, location)
);

CREATE INDEX IF NOT EXISTS idx_seo_views_page ON public.seo_page_views(page_type, page_slug);
CREATE INDEX IF NOT EXISTS idx_seo_views_breed ON public.seo_page_views(breed, view_count DESC);
CREATE INDEX IF NOT EXISTS idx_seo_views_location ON public.seo_page_views(location, view_count DESC);

ALTER TABLE public.seo_page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read SEO stats" ON public.seo_page_views;
CREATE POLICY "Anyone can read SEO stats"
  ON public.seo_page_views
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert SEO views" ON public.seo_page_views;
CREATE POLICY "Anyone can insert SEO views"
  ON public.seo_page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================================
-- 9. TRIGGER: Auto-update breeder membership_tier from subscription
-- ============================================================================
CREATE OR REPLACE FUNCTION update_breeder_membership_tier()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.breeders
  SET membership_tier = NEW.tier,
      is_featured = (NEW.tier = 'gold' AND NEW.status = 'active')
  WHERE id = NEW.breeder_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_breeder_tier ON public.breeder_subscriptions;
CREATE TRIGGER trg_update_breeder_tier
  AFTER INSERT OR UPDATE ON public.breeder_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_breeder_membership_tier();

-- ============================================================================
-- 10. ENHANCED INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_breeders_status_tier ON public.breeders(status, membership_tier, name);
CREATE INDEX IF NOT EXISTS idx_breeders_featured ON public.breeders(is_featured, featured_priority DESC, featured_until);
CREATE INDEX IF NOT EXISTS idx_breeders_town_county ON public.breeders(town, county);
CREATE INDEX IF NOT EXISTS idx_breeders_slug_status ON public.breeders(slug, status);
CREATE INDEX IF NOT EXISTS idx_breeder_breeds_breed ON public.breeder_breeds(breed);

-- ============================================================================
-- 11. BACKUP CONFIG (metadata tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.backup_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  backup_type text NOT NULL, -- 'manual', 'scheduled', 'pre_migration'
  tables_included text[],
  backup_size_bytes bigint,
  status text DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.backup_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view backup log" ON public.backup_log;
CREATE POLICY "Admins can view backup log"
  ON public.backup_log
  FOR ALL
  TO authenticated
  USING (is_admin());
