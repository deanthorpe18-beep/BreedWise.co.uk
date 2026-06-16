-- Migration 024: One claim per breeder + backfill claimed_at

-- ============================================================================
-- 1. PREVENT DUPLICATE CLAIMS ON THE SAME BREEDER BY ANY USER
-- ============================================================================
-- First, handle any existing duplicates by keeping only the most recent
-- pending/approved claim per breeder and rejecting the rest.
WITH ranked_claims AS (
  SELECT
    id,
    breeder_slug,
    ROW_NUMBER() OVER (
      PARTITION BY breeder_slug
      ORDER BY submitted_at DESC
    ) AS rn
  FROM public.claims
  WHERE status IN ('pending', 'under_review', 'approved')
)
UPDATE public.claims
SET status = 'rejected',
    admin_reason = 'Automatically rejected: duplicate claim on same breeder',
    reviewed_at = NOW(),
    reviewed_by = (SELECT id FROM auth.users LIMIT 1)
FROM ranked_claims
WHERE public.claims.id = ranked_claims.id
  AND ranked_claims.rn > 1;

-- Now create the unique index (one pending/approved claim per breeder)
CREATE UNIQUE INDEX IF NOT EXISTS idx_claims_unique_breeder_pending
  ON public.claims (breeder_slug)
  WHERE status IN ('pending', 'under_review', 'approved');

-- ============================================================================
-- 2. BACKFILL claimed_at FOR EXISTING CLAIMED BREEDERS
-- ============================================================================
UPDATE public.breeders
SET claimed_at = COALESCE(claimed_at, NOW())
WHERE status = 'claimed_profile'
  AND claimed_at IS NULL;

-- ============================================================================
-- 3. INDEX TO SPEED UP "JUST CLAIMED" QUERIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_breeders_claimed_at_status
  ON public.breeders(claimed_at, status)
  WHERE status = 'claimed_profile';
