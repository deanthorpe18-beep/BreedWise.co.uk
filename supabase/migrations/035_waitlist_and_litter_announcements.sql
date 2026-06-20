-- Public litter announcements, breeder waitlists, and litter email alerts

ALTER TABLE public.breeding_litters
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS announcement_text text,
  ADD COLUMN IF NOT EXISTS announced_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_breeding_litters_public
  ON public.breeding_litters(breeder_id, is_public)
  WHERE is_public = true;

ALTER TABLE public.saved_searches
  ADD COLUMN IF NOT EXISTS notify_litters boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.breeder_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  name text,
  phone text,
  breed_interest text,
  message text,
  status text NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'contacted', 'fulfilled', 'withdrawn')),
  notify_new_litters boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_notified_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_breeder_waitlist_email
  ON public.breeder_waitlist(breeder_id, lower(email));

CREATE INDEX IF NOT EXISTS idx_breeder_waitlist_breeder
  ON public.breeder_waitlist(breeder_id, status);

ALTER TABLE public.breeder_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "breeder_waitlist_service" ON public.breeder_waitlist;
CREATE POLICY "breeder_waitlist_service"
  ON public.breeder_waitlist FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
