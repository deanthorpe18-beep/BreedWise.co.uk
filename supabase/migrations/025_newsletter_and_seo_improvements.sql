-- Migration 025: Newsletter subscribers table + SEO helpers

-- ============================================================================
-- 1. NEWSLETTER SUBSCRIBERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  source text DEFAULT 'website'
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Service role can manage newsletter"
  ON public.newsletter_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 2. ADD updated_at TO BREEDERS FOR SITEMAP lastmod
-- ============================================================================
ALTER TABLE public.breeders
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_breeders_updated_at ON public.breeders;
CREATE TRIGGER trg_breeders_updated_at
  BEFORE UPDATE ON public.breeders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 3. INDEX FOR SITEMAP QUERIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_breeders_status_updated ON public.breeders(status, updated_at);
