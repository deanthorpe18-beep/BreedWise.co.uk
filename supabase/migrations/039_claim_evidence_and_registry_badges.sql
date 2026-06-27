-- Migration 039: Flexible claim evidence + separate admin-verified registry badges

ALTER TABLE public.claims
  ADD COLUMN IF NOT EXISTS breeder_type text;

COMMENT ON COLUMN public.claims.breeder_type IS 'Self-selected breeder category from claim form dropdown';

ALTER TABLE public.breeders
  ADD COLUMN IF NOT EXISTS kc_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS gccf_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tica_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS other_registry_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS other_registry_label text;

COMMENT ON COLUMN public.breeders.kc_verified IS 'Admin verified Kennel Club registration';
COMMENT ON COLUMN public.breeders.gccf_verified IS 'Admin verified GCCF registration';
COMMENT ON COLUMN public.breeders.tica_verified IS 'Admin verified TICA registration';
COMMENT ON COLUMN public.breeders.other_registry_verified IS 'Admin verified other breed registry';
COMMENT ON COLUMN public.breeders.other_registry_label IS 'Display label for other verified registry (e.g. BRC)';

CREATE INDEX IF NOT EXISTS idx_breeders_kc_verified ON public.breeders(kc_verified) WHERE kc_verified = true;
CREATE INDEX IF NOT EXISTS idx_breeders_gccf_verified ON public.breeders(gccf_verified) WHERE gccf_verified = true;

ALTER TABLE public.claim_evidence DROP CONSTRAINT IF EXISTS claim_evidence_evidence_type_check;

ALTER TABLE public.claim_evidence
  ADD CONSTRAINT claim_evidence_evidence_type_check
  CHECK (evidence_type IN (
    'licence',
    'kennel_club',
    'gccf',
    'tica',
    'business_reg',
    'ownership_proof',
    'website_social',
    'insurance',
    'vet_reference',
    'supporting_doc'
  ));
