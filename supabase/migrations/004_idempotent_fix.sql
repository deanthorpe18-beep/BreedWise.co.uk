-- BreedWise Schema Update 004
-- Makes all previous migrations fully idempotent to prevent "already exists" errors.

-- Fix: Claims policies already exist from 002 - drop and recreate only if needed
DROP POLICY IF EXISTS "Claims: public insert" ON public.claims;
DROP POLICY IF EXISTS "Claims: auth insert" ON public.claims;
DROP POLICY IF EXISTS "Claims: users read own" ON public.claims;
DROP POLICY IF EXISTS "Claims: admins update all" ON public.claims;

CREATE POLICY "Claims: auth insert"
  ON public.claims FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Claims: users read own"
  ON public.claims FOR SELECT
  USING (
    claimant_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Claims: admins update all"
  ON public.claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Fix: Removals policies already exist from 002
DROP POLICY IF EXISTS "Removals: public insert" ON public.removals;
DROP POLICY IF EXISTS "Removals: auth insert" ON public.removals;
DROP POLICY IF EXISTS "Removals: users read own" ON public.removals;
DROP POLICY IF EXISTS "Removals: admins update all" ON public.removals;

CREATE POLICY "Removals: auth insert"
  ON public.removals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Removals: users read own"
  ON public.removals FOR SELECT
  USING (
    requester_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Removals: admins update all"
  ON public.removals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Ensure all tables from 002 exist idempotently
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

CREATE TABLE IF NOT EXISTS public.breeder_breeds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  breed text NOT NULL,
  UNIQUE (breeder_id, breed)
);

CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_hash text,
  ip_hash text,
  succeeded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add breeder_photos table for Google Places images
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

-- Ensure 003 columns exist
ALTER TABLE public.removals
  ADD COLUMN IF NOT EXISTS hard_deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS hard_deleted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status_update_sent_at timestamptz;

ALTER TABLE public.claims
  ADD COLUMN IF NOT EXISTS status_update_sent_at timestamptz;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_breeders_slug ON public.breeders(slug);
CREATE INDEX IF NOT EXISTS idx_breeders_town ON public.breeders(town);
CREATE INDEX IF NOT EXISTS idx_breeders_county ON public.breeders(county);
CREATE INDEX IF NOT EXISTS idx_breeders_status ON public.breeders(status);
CREATE INDEX IF NOT EXISTS idx_breeder_breeds_breed ON public.breeder_breeds(breed);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email ON public.auth_attempts(email_hash);
CREATE INDEX IF NOT EXISTS idx_removals_hard_deleted ON public.removals(hard_deleted_at);
CREATE INDEX IF NOT EXISTS idx_breeder_photos_breeder ON public.breeder_photos(breeder_id);

-- RLS on new tables
ALTER TABLE public.breeders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeder_breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeder_photos ENABLE ROW LEVEL SECURITY;

-- Idempotent policies for breeders and breeds
DROP POLICY IF EXISTS "Breeders: public read active" ON public.breeders;
DROP POLICY IF EXISTS "Breeders: admin manage" ON public.breeders;

CREATE POLICY "Breeders: public read active"
  ON public.breeders FOR SELECT
  USING (status IN ('public_listing', 'claimed_profile'));

CREATE POLICY "Breeders: admin manage"
  ON public.breeders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Breeder breeds: public read" ON public.breeder_breeds;
DROP POLICY IF EXISTS "Breeder breeds: admin manage" ON public.breeder_breeds;

CREATE POLICY "Breeder breeds: public read"
  ON public.breeder_breeds FOR SELECT
  USING (true);

CREATE POLICY "Breeder breeds: admin manage"
  ON public.breeder_breeds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Auth attempts: no public access" ON public.auth_attempts;
CREATE POLICY "Auth attempts: no public access"
  ON public.auth_attempts FOR ALL
  USING (false);

DROP POLICY IF EXISTS "Breeder photos: public read" ON public.breeder_photos;
DROP POLICY IF EXISTS "Breeder photos: admin manage" ON public.breeder_photos;

CREATE POLICY "Breeder photos: public read"
  ON public.breeder_photos FOR SELECT
  USING (true);

CREATE POLICY "Breeder photos: admin manage"
  ON public.breeder_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
