-- Migration 006: Apply missing tables and columns from 002-005
-- This migration is idempotent and only creates objects that don't exist yet.

-- ============================================
-- BREEDERS TABLE (from 002)
-- ============================================
CREATE TABLE IF NOT EXISTS public.breeders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  address text,
  town text NOT NULL,
  postcode text,
  county text NOT NULL,
  region text NOT NULL,
  country text NOT NULL DEFAULT 'england',
  lat numeric(10,6),
  lng numeric(10,6),
  website text,
  phone text,
  email text,
  google_rating numeric(2,1),
  google_place_id text,
  kennel_club text,
  council_licence text,
  health_testing text,
  about text,
  location_notes text,
  status text NOT NULL DEFAULT 'public_listing' CHECK (status IN ('public_listing', 'claimed_profile', 'hidden', 'archived')),
  claimed boolean NOT NULL DEFAULT false,
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  source_tags text[] DEFAULT '{}',
  confidence_score numeric(3,2) DEFAULT 0.85,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add photo columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'breeders' AND column_name = 'google_photo_urls') THEN
    ALTER TABLE public.breeders ADD COLUMN google_photo_urls text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'breeders' AND column_name = 'google_photos_last_updated') THEN
    ALTER TABLE public.breeders ADD COLUMN google_photos_last_updated timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'breeders' AND column_name = 'hero_image_url') THEN
    ALTER TABLE public.breeders ADD COLUMN hero_image_url text;
  END IF;
END $$;

-- ============================================
-- BREEDER_BREEDS TABLE (from 002)
-- ============================================
CREATE TABLE IF NOT EXISTS public.breeder_breeds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  breed text NOT NULL,
  UNIQUE (breeder_id, breed)
);

-- ============================================
-- AUTH_ATTEMPTS TABLE (from 002)
-- ============================================
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_hash text,
  ip_hash text,
  succeeded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- BREEDER_PHOTOS TABLE (from 004)
-- ============================================
CREATE TABLE IF NOT EXISTS public.breeder_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  photo_reference text NOT NULL,
  photo_url text,
  width integer,
  height integer,
  attribution text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- COOKIE_CONSENTS TABLE (from 005)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cookie_consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    anonymous_id text,
    consent_given boolean NOT NULL DEFAULT false,
    essential boolean NOT NULL DEFAULT true,
    analytics boolean NOT NULL DEFAULT false,
    marketing boolean NOT NULL DEFAULT false,
    preferences text,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- ADMIN_AUDIT_LOG TABLE (from 005)
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,
    target_table text,
    target_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- EMAIL_CHANGES TABLE (from 005)
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_changes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_email text NOT NULL,
    new_email text NOT NULL,
    confirmed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_breeders_slug ON public.breeders(slug);
CREATE INDEX IF NOT EXISTS idx_breeders_town ON public.breeders(town);
CREATE INDEX IF NOT EXISTS idx_breeders_county ON public.breeders(county);
CREATE INDEX IF NOT EXISTS idx_breeders_region ON public.breeders(region);
CREATE INDEX IF NOT EXISTS idx_breeders_status ON public.breeders(status);
CREATE INDEX IF NOT EXISTS idx_breeder_breeds_breed ON public.breeder_breeds(breed);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email ON public.auth_attempts(email_hash);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_created ON public.auth_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_removals_hard_deleted ON public.removals(hard_deleted_at);
CREATE INDEX IF NOT EXISTS idx_breeder_photos_breeder ON public.breeder_photos(breeder_id);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.breeders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeder_breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeder_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_changes ENABLE ROW LEVEL SECURITY;

-- Breeders policies
DROP POLICY IF EXISTS "Breeders: public read active" ON public.breeders;
CREATE POLICY "Breeders: public read active"
  ON public.breeders FOR SELECT
  USING (status IN ('public_listing', 'claimed_profile'));

DROP POLICY IF EXISTS "Breeders: admin manage" ON public.breeders;
CREATE POLICY "Breeders: admin manage"
  ON public.breeders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Breeder breeds policies
DROP POLICY IF EXISTS "Breeder breeds: public read" ON public.breeder_breeds;
CREATE POLICY "Breeder breeds: public read"
  ON public.breeder_breeds FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Breeder breeds: admin manage" ON public.breeder_breeds;
CREATE POLICY "Breeder breeds: admin manage"
  ON public.breeder_breeds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Auth attempts policies
DROP POLICY IF EXISTS "Auth attempts: no public access" ON public.auth_attempts;
CREATE POLICY "Auth attempts: no public access"
  ON public.auth_attempts FOR ALL
  USING (false);

-- Breeder photos policies
DROP POLICY IF EXISTS "Breeder photos: public read" ON public.breeder_photos;
CREATE POLICY "Breeder photos: public read"
  ON public.breeder_photos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Breeder photos: admin manage" ON public.breeder_photos;
CREATE POLICY "Breeder photos: admin manage"
  ON public.breeder_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Cookie consents policies
DROP POLICY IF EXISTS "Cookie consents: users read own" ON public.cookie_consents;
CREATE POLICY "Cookie consents: users read own"
    ON public.cookie_consents
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Cookie consents: public insert" ON public.cookie_consents;
CREATE POLICY "Cookie consents: public insert"
    ON public.cookie_consents
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Cookie consents: users update own" ON public.cookie_consents;
CREATE POLICY "Cookie consents: users update own"
    ON public.cookie_consents
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Admin audit log policies
DROP POLICY IF EXISTS "Audit log: admins read" ON public.admin_audit_log;
CREATE POLICY "Audit log: admins read"
    ON public.admin_audit_log
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    ));

DROP POLICY IF EXISTS "Audit log: admins insert" ON public.admin_audit_log;
CREATE POLICY "Audit log: admins insert"
    ON public.admin_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    ));

-- Email changes policies
DROP POLICY IF EXISTS "Email changes: users read own" ON public.email_changes;
CREATE POLICY "Email changes: users read own"
    ON public.email_changes
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'cookie_consents_updated_at'
    ) THEN
        CREATE TRIGGER cookie_consents_updated_at
        BEFORE UPDATE ON public.cookie_consents
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $$;
