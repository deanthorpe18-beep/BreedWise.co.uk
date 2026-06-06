-- BreedWise Initial Schema
-- Tables: profiles, claims, removals, breeder_updates, contact_submissions
-- All tables have Row Level Security (RLS) enabled by default.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role enum type
CREATE TYPE public.app_role AS ENUM ('public', 'breeder', 'admin');

-- Profiles table extends Supabase Auth users
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text,
  role public.app_role NOT NULL DEFAULT 'breeder',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'breeder'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Claims table for breeders claiming their listings
CREATE TABLE public.claims (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  breeder_slug text NOT NULL,
  breeder_name text,
  claimant_email text NOT NULL,
  claimant_name text,
  claimant_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  notes text,
  admin_reason text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Removal requests table
CREATE TABLE public.removals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  breeder_slug text NOT NULL,
  breeder_name text,
  requester_email text NOT NULL,
  requester_name text,
  requester_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  admin_notes text,
  admin_reason text,
  gdpr_article_17 boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Breeder update submissions (for approved claimants)
CREATE TABLE public.breeder_updates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  breeder_slug text NOT NULL,
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  field_name text NOT NULL,
  old_value text,
  new_value text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Contact / general enquiries
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Analytics events (server-side, minimal PII)
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type text NOT NULL,
  page_path text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Google API refresh log
CREATE TABLE public.google_refresh_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  status text NOT NULL,
  records_processed integer,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Indexes for performance
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_claims_breeder_slug ON public.claims(breeder_slug);
CREATE INDEX idx_removals_status ON public.removals(status);
CREATE INDEX idx_removals_breeder_slug ON public.removals(breeder_slug);
CREATE INDEX idx_breeder_updates_status ON public.breeder_updates(status);
CREATE INDEX idx_breeder_updates_breeder_slug ON public.breeder_updates(breeder_slug);
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.removals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeder_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_refresh_log ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile, admins can read all
CREATE POLICY "Profiles: users read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Profiles: admins read all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Profiles: users update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Claims: authenticated users can insert their own claims
CREATE POLICY "Claims: public insert"
  ON public.claims FOR INSERT
  WITH CHECK (true);

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

-- Removals: public can insert, admins can read/update all
CREATE POLICY "Removals: public insert"
  ON public.removals FOR INSERT
  WITH CHECK (true);

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

-- Breeder updates: breeders can insert for their claimed listings, admins can manage
CREATE POLICY "Breeder updates: breeders insert own"
  ON public.breeder_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('breeder', 'admin')
    )
  );

CREATE POLICY "Breeder updates: users read own"
  ON public.breeder_updates FOR SELECT
  USING (
    submitted_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Breeder updates: admins update all"
  ON public.breeder_updates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Contact submissions: public insert, admins read
CREATE POLICY "Contact: public insert"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Contact: admins read all"
  ON public.contact_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Analytics: public cannot read/write directly (server only)
CREATE POLICY "Analytics: no public access"
  ON public.analytics_events FOR ALL
  USING (false);

-- Google refresh log: admin read only
CREATE POLICY "Google refresh: admin read"
  ON public.google_refresh_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
