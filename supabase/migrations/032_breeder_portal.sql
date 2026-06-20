-- Licensed breeder portal: breeding stock, litters, and individual pups/kittens

CREATE TABLE IF NOT EXISTS public.breeding_animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  name text NOT NULL,
  animal_type text NOT NULL DEFAULT 'dog',
  breed text NOT NULL,
  sex text CHECK (sex IN ('male', 'female')),
  date_of_birth date,
  microchip text,
  registration_number text,
  colour text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_breeding_animals_breeder ON public.breeding_animals(breeder_id);
CREATE INDEX IF NOT EXISTS idx_breeding_animals_active ON public.breeding_animals(breeder_id, is_active);

CREATE TABLE IF NOT EXISTS public.breeding_litters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  sire_id uuid REFERENCES public.breeding_animals(id) ON DELETE SET NULL,
  dam_id uuid REFERENCES public.breeding_animals(id) ON DELETE SET NULL,
  animal_type text NOT NULL DEFAULT 'dog',
  breed text NOT NULL,
  litter_name text,
  birth_date date,
  expected_go_home_date date,
  total_born integer,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('planned', 'active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_breeding_litters_breeder ON public.breeding_litters(breeder_id, birth_date DESC);

CREATE TABLE IF NOT EXISTS public.breeding_litter_animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  litter_id uuid NOT NULL REFERENCES public.breeding_litters(id) ON DELETE CASCADE,
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  name text,
  sex text DEFAULT 'unknown' CHECK (sex IN ('male', 'female', 'unknown')),
  colour text,
  microchip text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'kept', 'deceased')),
  sold_date date,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_breeding_litter_animals_litter ON public.breeding_litter_animals(litter_id);

ALTER TABLE public.breeding_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeding_litters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeding_litter_animals ENABLE ROW LEVEL SECURITY;

-- Service role / API handles access; block direct client reads for now
DROP POLICY IF EXISTS "breeding_animals_service" ON public.breeding_animals;
CREATE POLICY "breeding_animals_service"
  ON public.breeding_animals FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "breeding_litters_service" ON public.breeding_litters;
CREATE POLICY "breeding_litters_service"
  ON public.breeding_litters FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "breeding_litter_animals_service" ON public.breeding_litter_animals;
CREATE POLICY "breeding_litter_animals_service"
  ON public.breeding_litter_animals FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
