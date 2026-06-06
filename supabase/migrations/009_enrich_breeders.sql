-- Migration 009: Enrich breeders with more Google Places data
-- Adds review count and business type columns

-- Add google_review_count if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'breeders' AND column_name = 'google_review_count'
  ) THEN
    ALTER TABLE public.breeders ADD COLUMN google_review_count integer;
  END IF;
END $$;

-- Add business_type if not exists (e.g. "Pet Store", "Dog Breeder", etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'breeders' AND column_name = 'business_type'
  ) THEN
    ALTER TABLE public.breeders ADD COLUMN business_type text;
  END IF;
END $$;

-- Add index on google_rating for fast sorting
CREATE INDEX IF NOT EXISTS idx_breeders_rating ON public.breeders(google_rating DESC NULLS LAST);

-- Add index on google_review_count
CREATE INDEX IF NOT EXISTS idx_breeders_review_count ON public.breeders(google_review_count DESC NULLS LAST);

-- Add index on business_type
CREATE INDEX IF NOT EXISTS idx_breeders_business_type ON public.breeders(business_type);
